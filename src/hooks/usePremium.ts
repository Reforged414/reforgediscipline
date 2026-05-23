import { useEffect, useState, useCallback } from 'react';

/**
 * RevenueCat integration scaffold.
 *
 * On native (iOS/Android) we'll wire this to the RevenueCat SDK using the API key below.
 * On web preview, premium status is driven by a localStorage flag so we can toggle
 * `isPremium` for testing without a native runtime.
 *
 * Toggle in the browser console:
 *   localStorage.setItem('reforged-premium-mock', 'true');  // grant premium
 *   localStorage.removeItem('reforged-premium-mock');       // revoke
 *   window.dispatchEvent(new Event('reforged-premium-changed'));
 */
export const REVENUECAT_API_KEY = 'test_CyPXbfEnCZesYEIUymLkvPcgHBc';

const STORAGE_KEY = 'reforged-premium-mock';
const CHANGE_EVENT = 'reforged-premium-changed';

export async function checkPremiumStatus(): Promise<boolean> {
  // TODO (native): replace this branch with RevenueCat SDK call:
  //   await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  //   const info = await Purchases.getCustomerInfo();
  //   return Object.keys(info.entitlements.active).length > 0;
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
