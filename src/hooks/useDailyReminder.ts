import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/hooks/use-toast';

/**
 * Makes the "Daily check-in reminder" preference actually do something.
 *
 * - Native (iOS/Android): schedules a repeating daily local notification at the
 *   chosen time via @capacitor/local-notifications.
 * - Web: best-effort — asks for Notification permission and fires a
 *   notification once per day at the chosen time while the app is open.
 */

const REMINDER_ID = 918273;
const WEB_FIRED_KEY = 'reforged-reminder-last-fired';

function parseTime(t: string): { hour: number; minute: number } {
  const [h, m] = (t || '09:00').split(':').map((n) => parseInt(n, 10));
  return { hour: Number.isNaN(h) ? 9 : h, minute: Number.isNaN(m) ? 0 : m };
}

const REMINDER_TITLE = 'Daily Check-In';
const REMINDER_BODY = 'Keep your streak alive — check in with Reforged.';

export function useDailyReminder() {
  const enabled = useAppStore((s) => s.notificationPrefs.dailyCheckInEnabled);
  const time = useAppStore((s) => s.notificationPrefs.dailyCheckInTime);
  const updateNotificationPrefs = useAppStore((s) => s.updateNotificationPrefs);

  useEffect(() => {
    let cancelled = false;
    let webTimer: ReturnType<typeof setInterval> | null = null;

    const disableWithNotice = () => {
      if (cancelled) return;
      toast({
        title: 'Notifications blocked',
        description: 'Allow notifications for Reforged in your system settings, then re-enable the reminder.',
      });
      updateNotificationPrefs({ dailyCheckInEnabled: false });
    };

    const applyNative = async () => {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      // Clear any previously scheduled reminder before (re)scheduling.
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.some((n) => n.id === REMINDER_ID)) {
        await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
      }
      if (!enabled || cancelled) return;

      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        disableWithNotice();
        return;
      }

      const { hour, minute } = parseTime(time);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: REMINDER_ID,
            title: REMINDER_TITLE,
            body: REMINDER_BODY,
            schedule: { on: { hour, minute }, allowWhileIdle: true },
          },
        ],
      });
    };

    const applyWeb = async () => {
      if (!enabled || !('Notification' in window)) return;

      if (Notification.permission === 'denied') {
        disableWithNotice();
        return;
      }
      if (Notification.permission === 'default') {
        const p = await Notification.requestPermission();
        if (p !== 'granted') {
          disableWithNotice();
          return;
        }
      }
      if (cancelled) return;

      const { hour, minute } = parseTime(time);
      webTimer = setInterval(() => {
        const now = new Date();
        if (now.getHours() !== hour || now.getMinutes() !== minute) return;
        const today = now.toISOString().split('T')[0];
        if (localStorage.getItem(WEB_FIRED_KEY) === today) return;
        localStorage.setItem(WEB_FIRED_KEY, today);
        const s = useAppStore.getState();
        const alreadyDone = s.dailyDiscipline.date === today && s.dailyDiscipline.checkedIn;
        if (!alreadyDone) new Notification(REMINDER_TITLE, { body: REMINDER_BODY });
      }, 30_000);
    };

    const run = Capacitor.isNativePlatform() ? applyNative : applyWeb;
    run().catch((e) => console.error('[Reminder] scheduling failed', e));

    return () => {
      cancelled = true;
      if (webTimer) clearInterval(webTimer);
    };
  }, [enabled, time, updateNotificationPrefs]);
}
