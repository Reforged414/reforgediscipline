/**
 * Deep-link helper: lets the Insights screen pre-fill the Reforged Shield
 * schedule (time range + protection layer) before navigating to that screen.
 */

const STORAGE_KEY = 'reforged-shield-config';
export const SHIELD_CONFIG_EVENT = 'reforged-shield-config-changed';

export type ShieldLayer = 'websites' | 'apps';

export interface ShieldSuggestion {
  start: string; // "21:00"
  end: string; // "23:00"
  layer: ShieldLayer;
}

/** Patch the persisted shield config and notify a mounted Shield screen. */
export function applyShieldSuggestion({ start, end, layer }: ShieldSuggestion) {
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    existing = {};
  }
  const next = {
    ...existing,
    scheduleEnabled: true,
    scheduleStart: start,
    scheduleEnd: end,
    ...(layer === 'websites' ? { blockWebsites: true } : { blockApps: true }),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(SHIELD_CONFIG_EVENT));
}

/** Round an hour (0-23) to a "HH:00" clock string. */
export function hourToClock(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  return `${String(h).padStart(2, '0')}:00`;
}

/** "9-11 PM" style label for an hour range. */
export function formatHourRange(startHour: number, endHour: number) {
  const label = (h: number) => {
    const hh = ((h % 24) + 24) % 24;
    const suffix = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return { h12, suffix };
  };
  const a = label(startHour);
  const b = label(endHour);
  return a.suffix === b.suffix
    ? `${a.h12}-${b.h12} ${b.suffix}`
    : `${a.h12} ${a.suffix} - ${b.h12} ${b.suffix}`;
}
