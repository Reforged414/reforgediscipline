import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, type PurchasesPackage } from '@revenuecat/purchases-capacitor';

/**
 * RevenueCat integration.
 *
 * On native (iOS/Android) we use the RevenueCat SDK with the public API key below.
 * On web preview, premium status is driven by a localStorage flag so we can toggle
 * `isPremium` for testing without a native runtime.
 *
 * Toggle in the browser console (web only):
 *   localStorage.setItem('reforged-premium-mock', 'true');  // grant premium
 *   localStorage.removeItem('reforged-premium-mock');       // revoke
 *   window.dispatchEvent(new Event('reforged-premium-changed'));
 */
export const REVENUECAT_API_KEY_IOS = 'appl_wzGPtevzTtXqjroAwnmnNVnQpde';
export const REVENUECAT_API_KEY_ANDROID = 'goog_uJSgGrbNyysXIsCzsvSPKyVlvFP';
/** Legacy alias kept for backwards-compat with older imports. */
export const REVENUECAT_API_KEY = REVENUECAT_API_KEY_IOS;
export const PREMIUM_ENTITLEMENT_ID = 'reforged_pro';

const STORAGE_KEY = 'reforged-premium-mock';
const CHANGE_EVENT = 'reforged-premium-changed';

let rcConfigured = false;

export async function initRevenueCat() {
  if (!Capacitor.isNativePlatform() || rcConfigured) return;
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
    const platform = Capacitor.getPlatform();
    const apiKey = platform === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
    await Purchases.configure({ apiKey });
    rcConfigured = true;
  } catch (err) {
    console.error('[RevenueCat] configure failed', err);
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await initRevenueCat();
      const { customerInfo } = await Purchases.getCustomerInfo();
      const entitlements = customerInfo?.entitlements?.active ?? {};
      return !!entitlements[PREMIUM_ENTITLEMENT_ID];
    } catch (err) {
      console.error('[RevenueCat] getCustomerInfo failed', err);
      return false;
    }
  }
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setMockPremium(value: boolean) {
  if (value) localStorage.setItem(STORAGE_KEY, 'true');
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function notifyPremiumChanged() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Fetch the current offering's available packages from RevenueCat.
 * Returns [] on web (no native runtime).
 */
export async function fetchOfferingPackages(): Promise<PurchasesPackage[]> {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    await initRevenueCat();
    const { current } = await Purchases.getOfferings();
    return current?.availablePackages ?? [];
  } catch (err) {
    console.error('[RevenueCat] getOfferings failed', err);
    return [];
  }
}

/**
 * Purchase a package and return whether the premium entitlement is now active.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  await initRevenueCat();
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  const active = !!customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID];
  notifyPremiumChanged();
  return active;
}

export async function restorePurchases(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return checkPremiumStatus();
  }
  await initRevenueCat();
  const { customerInfo } = await Purchases.restorePurchases();
  const active = !!customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID];
  notifyPremiumChanged();
  return active;
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await checkPremiumStatus();
    setIsPremium(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  return { isPremium, loading, refresh, setMockPremium };
}
