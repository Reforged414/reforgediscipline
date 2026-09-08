import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { computeAchievements, type Achievement } from '@/lib/achievements';

const SEEN_KEY = 'reforged-seen-achievements';

/** Ids unlocked during this app session — used to play the unlock animation on cards. */
export const sessionUnlockedIds = new Set<string>();

const readSeen = (): string[] => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const writeSeen = (ids: string[]) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
};

/**
 * Computes achievements and detects the moment one unlocks, so a celebration
 * can be shown once (tracked in localStorage).
 */
export const useAchievements = () => {
  const store = useAppStore();
  const achievements = useMemo(() => computeAchievements(store), [store]);

  const [celebrating, setCelebrating] = useState<Achievement | null>(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const initialised = useRef(false);

  useEffect(() => {
    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);

    if (!initialised.current) {
      initialised.current = true;
      if (localStorage.getItem(SEEN_KEY) === null) {
        // First run: treat existing unlocks as already seen.
        writeSeen(unlockedIds);
        return;
      }
    }

    const seen = readSeen();
    const fresh = unlockedIds.filter((id) => !seen.includes(id));
    if (fresh.length === 0) return;

    writeSeen([...seen, ...fresh]);
    setRecentlyUnlocked((prev) => [...prev, ...fresh]);
    const next = achievements.find((a) => a.id === fresh[0]) ?? null;
    setCelebrating(next);
  }, [achievements]);

  return {
    achievements,
    celebrating,
    recentlyUnlocked,
    dismissCelebration: () => setCelebrating(null),
  };
};
