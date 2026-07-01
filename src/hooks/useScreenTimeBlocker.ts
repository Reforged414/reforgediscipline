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

/** iOS plugin — must match WebBlockerPlugin.m's CAP_PLUGIN(WebBlockerPlugin, "WebBlockerPlugin", ...) */
interface IOSWebBlockerPlugin {
  requestAuthorization(): Promise<{ status: string; error?: string }>;
  checkAuthorization(): Promise<{ status: string; familyControls?: boolean }>;
  activateShield(): Promise<{ active: boolean; reason?: string }>;
  deactivateShield(): Promise<{ active: boolean }>;
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
  const activate = useCallback(() => activateImpl(), []);
  const deactivate = useCallback(() => deactivateImpl(), []);

  return {
    isNative: Capacitor.isNativePlatform(),
    platform,
    requestAuthorization,
    checkPermissions,
    openAccessibilitySettings,
    openUsageAccessSettings,
    activate,
    deactivate,
  };
}
