import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';

const NUDGE_KEY = 'reforged-guest-last-nudge';
const NUDGE_COOLDOWN_MS = 1000 * 60 * 60 * 6; // 6 hours

function shouldNudge() {
  const last = Number(localStorage.getItem(NUDGE_KEY) ?? 0);
  return Date.now() - last > NUDGE_COOLDOWN_MS;
}

function markNudged() {
  localStorage.setItem(NUDGE_KEY, String(Date.now()));
}

/**
 * Watches key progress events (check-in, urge logs, streak gains) and shows a
 * subtle, throttled toast prompting guests to create an account to save their data.
 */
export function useGuestNudge() {
  const { isGuest, session } = useAuth();
  const initialized = useRef(false);
  const prev = useRef({ checkedIn: false, urges: 0, streak: 0 });

  useEffect(() => {
    if (!isGuest || session) return;

    // Seed without firing on mount
    const s = useAppStore.getState();
    prev.current = {
      checkedIn: s.dailyDiscipline.checkedIn,
      urges: s.urgeLogs.length,
      streak: s.streak,
    };
    initialized.current = true;

    const unsub = useAppStore.subscribe((state) => {
      if (!initialized.current) return;
      const justCheckedIn = !prev.current.checkedIn && state.dailyDiscipline.checkedIn;
      const justLoggedUrge = state.urgeLogs.length > prev.current.urges;
      const streakGained = state.streak > prev.current.streak;

      prev.current = {
        checkedIn: state.dailyDiscipline.checkedIn,
        urges: state.urgeLogs.length,
        streak: state.streak,
      };

      if ((justCheckedIn || justLoggedUrge || streakGained) && shouldNudge()) {
        markNudged();
        toast({
          title: 'Save your progress',
          description: 'Create an account so your streak and logs are never lost.',
        });
      }
    });

    return () => unsub();
  }, [isGuest, session]);
}
