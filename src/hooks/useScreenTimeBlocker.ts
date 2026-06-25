import { useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Unified JS surface for the native blocker bridges:
 *  - iOS: Apple FamilyControls / ManagedSettings (see ScreenTimeShieldPlugin.swift)
 *  - Android: AccessibilityService + PACKAGE_USAGE_STATS
 *    (see ScreenTimeShieldPlugin.java)
 *
 * On web the implementation falls back to `unsupported` so the UI can keep
 * working inside the Lovable preview.
 */
export type AuthorizationStatus = 'authorized' | 'denied' | 'notDetermined' | 'unsupported';

export interface PermissionState {
  status: AuthorizationStatus;
  /** iOS — FamilyControls approval */
  familyControls?: boolean;
  /** Android — Accessibility service enabled */
  accessibility?: boolean;
  /** Android — PACKAGE_USAGE_STATS granted */
  usageAccess?: boolean;
  error?: string;
}

export interface ScreenTimeShieldPlugin {
  requestAuthorization(): Promise<PermissionState>;
  checkPermissions(): Promise<PermissionState>;
  openAccessibilitySettings(): Promise<{ opened?: boolean }>;
  openUsageAccessSettings(): Promise<{ opened?: boolean }>;
  activateShield(): Promise<{ active: boolean; reason?: string }>;
  deactivateShield(): Promise<{ active: boolean }>;
}

const webFallback: ScreenTimeShieldPlugin = {
  requestAuthorization: async () => ({ status: 'unsupported' }),
  checkPermissions: async () => ({ status: 'unsupported' }),
  openAccessibilitySettings: async () => ({ opened: false }),
  openUsageAccessSettings: async () => ({ opened: false }),
  activateShield: async () => ({ active: false, reason: 'web' }),
  deactivateShield: async () => ({ active: false }),
};

export const ScreenTimeShield = Capacitor.isNativePlatform()
  ? registerPlugin<ScreenTimeShieldPlugin>('ScreenTimeShield', { web: () => webFallback })
  : webFallback;

/**
 * Unified permission request used by onboarding & Reforged Shield activation.
 *
 *  - iOS: triggers the FamilyControls system prompt.
 *  - Android: reports current state and (if either permission missing)
 *    deep-links the user to the relevant system settings menu.
 */
export async function ensureBlockerPermissions(): Promise<PermissionState> {
  const platform = Capacitor.getPlatform();
  const result = await ScreenTimeShield.requestAuthorization();

  if (platform === 'android' && result.status !== 'authorized') {
    // Route the user to whichever menu is still missing.
    if (result.accessibility === false) {
      await ScreenTimeShield.openAccessibilitySettings().catch(() => undefined);
    } else if (result.usageAccess === false) {
      await ScreenTimeShield.openUsageAccessSettings().catch(() => undefined);
    }
  }
  return result;
}

export function useScreenTimeBlocker() {
  const platform = Capacitor.getPlatform();

  const requestAuthorization = useCallback(() => ensureBlockerPermissions(), []);
  const checkPermissions = useCallback(() => ScreenTimeShield.checkPermissions(), []);
  const openAccessibilitySettings = useCallback(
    () => ScreenTimeShield.openAccessibilitySettings(),
    []
  );
  const openUsageAccessSettings = useCallback(
    () => ScreenTimeShield.openUsageAccessSettings(),
    []
  );
  const activate = useCallback(() => ScreenTimeShield.activateShield(), []);
  const deactivate = useCallback(() => ScreenTimeShield.deactivateShield(), []);

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
