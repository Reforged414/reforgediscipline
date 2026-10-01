import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { computeAchievements, type Achievement } from '@/lib/achievements';

const SEEN_KEY_PREFIX = 'reforged-seen-achievements_';
const GUEST_SEEN_KEY = 'reforged-seen-achievements_guest';

function getSeenKey(userId?: string | null): string {
  return userId ? SEEN_KEY_PREFIX + userId : GUEST_SEEN_KEY;
}

/** Ids unlocked during this app session — used to play the unlock animation on cards. */
export const sessionUnlockedIds = new Set<string>();

const readSeen = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const writeSeen = (key: string, ids: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
};

/**
 * Computes achievements and detects the moment one unlocks, so a celebration
 * can be shown once (tracked in localStorage, scoped per signed-in account).
 */
export const useAchievements = () => {
  const store = useAppStore();
  const { user } = useAuth();
  const achievements = useMemo(() => computeAchievements(store), [store]);

  const [celebrating, setCelebrating] = useState<Achievement | null>(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const initialisedForUser = useRef<string | null>(null);

  useEffect(() => {
    const key = getSeenKey(user?.id);
    const currentUserKey = user?.id ?? 'guest';
    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);

    if (initialisedForUser.current !== currentUserKey) {
      initialisedForUser.current = currentUserKey;
      if (localStorage.getItem(key) === null) {
        // First run for this account: treat existing unlocks as already seen.
        writeSeen(key, unlockedIds);
        return;
      }
    }

    const seen = readSeen(key);
    const fresh = unlockedIds.filter((id) => !seen.includes(id));
    if (fresh.length === 0) return;

    writeSeen(key, [...seen, ...fresh]);
    fresh.forEach((id) => sessionUnlockedIds.add(id));
    setRecentlyUnlocked((prev) => [...prev, ...fresh]);
    const next = achievements.find((a) => a.id === fresh[0]) ?? null;
    setCelebrating(next);
  }, [achievements, user?.id]);

  return {
    achievements,
    celebrating,
    recentlyUnlocked,
    dismissCelebration: () => setCelebrating(null),
  };
};