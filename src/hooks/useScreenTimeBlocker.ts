import { useCallback } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * JS surface for our native FamilyControls / ManagedSettings skeleton.
 * Matches `ios/App/App/ScreenTimeShieldPlugin.swift` and the Android
 * placeholder under `android/app/src/main/java/com/reforged/discipline/`.
 *
 * On web (Lovable preview) all calls resolve with `unsupported` so the UI
 * can gracefully fall back to its mock state.
 */
export interface ScreenTimeShieldPlugin {
  requestAuthorization(): Promise<{ status: 'authorized' | 'denied' | 'unsupported' }>;
  activateShield(): Promise<{ active: boolean; reason?: string }>;
  deactivateShield(): Promise<{ active: boolean }>;
}

const webFallback: ScreenTimeShieldPlugin = {
  requestAuthorization: async () => ({ status: 'unsupported' as const }),
  activateShield: async () => ({ active: false, reason: 'web' }),
  deactivateShield: async () => ({ active: false }),
};

const ScreenTimeShield = Capacitor.isNativePlatform()
  ? registerPlugin<ScreenTimeShieldPlugin>('ScreenTimeShield', { web: () => webFallback })
  : webFallback;

export function useScreenTimeBlocker() {
  const requestAuthorization = useCallback(() => ScreenTimeShield.requestAuthorization(), []);
  const activate = useCallback(() => ScreenTimeShield.activateShield(), []);
  const deactivate = useCallback(() => ScreenTimeShield.deactivateShield(), []);

  return {
    isNative: Capacitor.isNativePlatform(),
    requestAuthorization,
    activate,
    deactivate,
  };
}
