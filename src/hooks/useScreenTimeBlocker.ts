import { useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Unified JS surface for the native blocker bridges:
 *  - iOS: WebBlockerPlugin (FamilyControls / ManagedSettings) — see WebBlockerPlugin.swift + .m
 *  - Android: ScreenTimeShield (AccessibilityService + PACKAGE_USAGE_STATS)
 *
 * On web the implementation falls back to `unsupported` so the UI keeps
 * working inside the Lovable preview.
 */
export type AuthorizationStatus = 'authorized' | 'denied' | 'notDetermined' | 'unsupported';

export interface PermissionState {
  status: AuthorizationStatus;
  familyControls?: boolean;
  accessibility?: boolean;
  usageAccess?: boolean;
  error?: string;
  /** Raw debug payload from the native bridge — surfaced in alerts. */
  raw?: unknown;
}

export interface AppSelectionState {
  hasSelection: boolean;
  appCount: number;
  categoryCount: number;
}

/** iOS plugin — must match WebBlockerPlugin.swift's CAPBridgedPlugin declaration */
interface IOSWebBlockerPlugin {
  requestAuthorization(): Promise<{ status: string; error?: string }>;
  checkAuthorization(): Promise<{ status: string; familyControls?: boolean }>;
  activateShield(): Promise<{ active: boolean; reason?: string }>;
  deactivateShield(): Promise<{ active: boolean }>;
  openSettings(): Promise<{ opened?: boolean }>;
  showAppPicker(): Promise<{ selected: boolean; appCount: number; categoryCount: number }>;
  activateAppShield(): Promise<{ active: boolean; reason?: string }>;
  deactivateAppShield(): Promise<{ active: boolean }>;
  checkAppSelection(): Promise<AppSelectionState>;
}


/** Android plugin — matches @CapacitorPlugin(name = "ScreenTimeShield") */
interface AndroidShieldPlugin {
  requestAuthorization(): Promise<PermissionState>;
  checkPermissions(): Promise<PermissionState>;
  openAccessibilitySettings(): Promise<{ opened?: boolean }>;
  openUsageAccessSettings(): Promise<{ opened?: boolean }>;
  activateShield(): Promise<{ active: boolean; reason?: string }>;
  deactivateShield(): Promise<{ active: boolean }>;
}

const platform = Capacitor.getPlatform();

const iosWebBlocker =
  platform === 'ios'
    ? registerPlugin<IOSWebBlockerPlugin>('WebBlockerPlugin')
    : null;

const androidShield =
  platform === 'android'
    ? registerPlugin<AndroidShieldPlugin>('ScreenTimeShield')
    : null;

function normalizeStatus(s: string | undefined): AuthorizationStatus {
  if (s === 'authorized' || s === 'denied' || s === 'notDetermined' || s === 'unsupported') return s;
  return 'unsupported';
}

async function requestAuthorizationImpl(): Promise<PermissionState> {
  try {
    if (iosWebBlocker) {
      const res = await iosWebBlocker.requestAuthorization();
      return {
        status: normalizeStatus(res?.status),
        familyControls: res?.status === 'authorized',
        error: res?.error,
        raw: res,
      };
    }
    if (androidShield) {
      const res = await androidShield.requestAuthorization();
      return { ...res, raw: res };
    }
    return { status: 'unsupported' };
  } catch (e: any) {
    return { status: 'denied', error: e?.message || String(e), raw: e };
  }
}

async function checkPermissionsImpl(): Promise<PermissionState> {
  try {
    if (iosWebBlocker) {
      const res = await iosWebBlocker.checkAuthorization();
      return {
        status: normalizeStatus(res?.status),
        familyControls: !!res?.familyControls,
        raw: res,
      };
    }
    if (androidShield) {
      const res = await androidShield.checkPermissions();
      return { ...res, raw: res };
    }
    return { status: 'unsupported' };
  } catch (e: any) {
    return { status: 'denied', error: e?.message || String(e), raw: e };
  }
}

async function activateImpl() {
  if (iosWebBlocker) return iosWebBlocker.activateShield();
  if (androidShield) return androidShield.activateShield();
  return { active: false, reason: 'web' };
}

async function deactivateImpl() {
  if (iosWebBlocker) return iosWebBlocker.deactivateShield();
  if (androidShield) return androidShield.deactivateShield();
  return { active: false };
}

async function openAccessibilityImpl() {
  if (androidShield) return androidShield.openAccessibilitySettings();
  return { opened: false };
}
async function openUsageAccessImpl() {
  if (androidShield) return androidShield.openUsageAccessSettings();
  return { opened: false };
}

async function openSystemSettingsImpl() {
  if (iosWebBlocker) {
    try {
      return await iosWebBlocker.openSettings();
    } catch (e: any) {
      return { opened: false, error: e?.message || String(e) };
    }
  }
  if (androidShield) return androidShield.openAccessibilitySettings();
  return { opened: false };
}

// --- App blocking (iOS only for now — Android app blocking not yet implemented) ---

async function showAppPickerImpl(): Promise<{ selected: boolean; appCount: number; categoryCount: number }> {
  if (iosWebBlocker) {
    try {
      return await iosWebBlocker.showAppPicker();
    } catch (e: any) {
      return { selected: false, appCount: 0, categoryCount: 0 };
    }
  }
  return { selected: false, appCount: 0, categoryCount: 0 };
}

async function activateAppShieldImpl() {
  if (iosWebBlocker) return iosWebBlocker.activateAppShield();
  return { active: false, reason: 'unsupported' };
}

async function deactivateAppShieldImpl() {
  if (iosWebBlocker) return iosWebBlocker.deactivateAppShield();
  return { active: false };
}

async function checkAppSelectionImpl(): Promise<AppSelectionState> {
  if (iosWebBlocker) {
    try {
      return await iosWebBlocker.checkAppSelection();
    } catch (e: any) {
      return { hasSelection: false, appCount: 0, categoryCount: 0 };
    }
  }
  return { hasSelection: false, appCount: 0, categoryCount: 0 };
}

export async function ensureBlockerPermissions(): Promise<PermissionState> {
  const result = await requestAuthorizationImpl();
  if (platform === 'android' && result.status !== 'authorized') {
    if (result.accessibility === false) {
      await openAccessibilityImpl().catch(() => undefined);
    } else if (result.usageAccess === false) {
      await openUsageAccessImpl().catch(() => undefined);
    }
  }
  return result;
}

export function useScreenTimeBlocker() {
  const requestAuthorization = useCallback(() => ensureBlockerPermissions(), []);
  const checkPermissions = useCallback(() => checkPermissionsImpl(), []);
  const openAccessibilitySettings = useCallback(() => openAccessibilityImpl(), []);
  const openUsageAccessSettings = useCallback(() => openUsageAccessImpl(), []);
  const openSystemSettings = useCallback(() => openSystemSettingsImpl(), []);
  const activate = useCallback(() => activateImpl(), []);
  const deactivate = useCallback(() => deactivateImpl(), []);

  const showAppPicker = useCallback(() => showAppPickerImpl(), []);
  const activateAppShield = useCallback(() => activateAppShieldImpl(), []);
  const deactivateAppShield = useCallback(() => deactivateAppShieldImpl(), []);
  const checkAppSelection = useCallback(() => checkAppSelectionImpl(), []);

  return {
    isNative: Capacitor.isNativePlatform(),
    platform,
    requestAuthorization,
    checkPermissions,
    openAccessibilitySettings,
    openUsageAccessSettings,
    openSystemSettings,
    activate,
    deactivate,
    showAppPicker,
    activateAppShield,
    deactivateAppShield,
    checkAppSelection,
  };
}
