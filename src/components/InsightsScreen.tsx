import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import AICoachPanel, { type RiskWindow } from './AICoachPanel';
import UrgeHourChart from './insights/UrgeHourChart';
import TriggerLeaderboard from './insights/TriggerLeaderboard';
import {
  applyShieldSuggestion,
  formatHourRange,
  hourToClock,
  type ShieldLayer,
} from '@/lib/shieldSuggestion';
import { toast } from 'sonner';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const EmptyHint = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-muted-foreground italic leading-relaxed">{children}</p>
);

const InsightsScreen = ({ onGoToShield }: { onGoToShield?: () => void }) => {
  const { streak, urgeLogs, relapseLogs, resistedTimestamps, onboardingData, journalLogs } = useAppStore();


  const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const journalSnippets = [...journalLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15)
    .map((j) => {
      const d = new Date(j.timestamp);
      return { text: j.text, tag: j.tag, weekday: WEEKDAYS[d.getDay()], hour: d.getHours() };
    });
  const urgeWeekdayDistribution = urgeLogs.reduce<Record<string, number>>((acc, u) => {
    const d = WEEKDAYS[new Date(u.timestamp).getDay()];
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  // Determine days of logged data: based on first activity in app
  const firstLogTimestamp = [...urgeLogs, ...relapseLogs, ...resistedTimestamps.map((t) => ({ timestamp: t }))]
    .map((l: { timestamp: string }) => new Date(l.timestamp).getTime())
    .sort((a, b) => a - b)[0];
  const daysOfData = firstLogTimestamp
    ? Math.floor((Date.now() - firstLogTimestamp) / (1000 * 60 * 60 * 24))
    : 0;
  const hasEnoughForSuccessRate = daysOfData >= 7;

  // Urges this week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const urgesThisWeek = urgeLogs.filter(
    (u) => new Date(u.timestamp) >= weekAgo
  ).length;

  // Success rate: resisted / (resisted + relapsed)
  const totalResisted = resistedTimestamps.length;
  const totalRelapses = relapseLogs.length;
  const totalEvents = totalResisted + totalRelapses;
  const successRate = totalEvents > 0 ? Math.round((totalResisted / totalEvents) * 100) : 100;

  // Top triggers from urge + relapse logs
  const triggerCounts: Record<string, number> = {};
  urgeLogs.forEach((log) => {
    log.triggers.forEach((t) => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  const totalTriggers = Object.values(triggerCounts).reduce((a, b) => a + b, 0);
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, count]) => ({
      label,
      pct: totalTriggers > 0 ? Math.round((count / totalTriggers) * 100) : 0,
    }));

  // Peak insight only after 5+ urges
  const hasEnoughForPeak = urgeLogs.length >= 5;
  const timePeriods = { morning: 0, afternoon: 0, night: 0 };
  urgeLogs.forEach((u) => {
    const hour = new Date(u.timestamp).getHours();
    if (hour >= 5 && hour < 12) timePeriods.morning++;
    else if (hour >= 12 && hour < 18) timePeriods.afternoon++;
    else timePeriods.night++;
  });
  const peakPeriod = Object.entries(timePeriods).sort((a, b) => b[1] - a[1])[0];
  const peakLabel = peakPeriod?.[0] || 'night';
  const PeakIcon = peakLabel === 'morning' ? Sun : peakLabel === 'afternoon' ? Cloud : Moon;

  const peakInsight = `You're most vulnerable at ${peakLabel}`;

  const recommendation = peakLabel === 'night'
    ? { text: 'You struggle most after 11PM.', tip: 'Avoid phone use after 10:30 PM.' }
    : peakLabel === 'morning'
    ? { text: 'Mornings are your challenge.', tip: 'Start your day with a cold shower or exercise.' }
    : { text: 'Afternoons are your weak spot.', tip: 'Fill your afternoons with productive activities.' };

  return (
    <motion.div
      className="min-h-screen bg-background px-5 pt-10 pb-32 max-w-md mx-auto"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex items-center justify-center mb-2">
        <h1 className="font-display text-sm tracking-widest text-primary">REFORGED</h1>
      </motion.div>

      <motion.h2 variants={fadeUp} className="text-3xl font-display tracking-wider text-foreground text-center mb-1">Recovery</motion.h2>
      <motion.h2 variants={fadeUp} className="text-3xl font-display tracking-wider text-foreground text-center mb-8">Insights</motion.h2>

      {/* Peak Insight */}
      <motion.div variants={fadeUp} className="bg-secondary rounded-2xl p-5 mb-5 relative overflow-hidden">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2 font-semibold">Peak Insight</p>
        {hasEnoughForPeak ? (
          <>
            <p className="text-foreground text-lg font-medium leading-snug">{peakInsight}</p>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-sm" />
          </>
        ) : (
          <EmptyHint>Log a few urges to unlock your peak insight.</EmptyHint>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Current Streak</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-light text-foreground">{streak}</span>
            <span className="text-xs text-primary font-display">Days</span>
          </div>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Urges This Week</p>
          <span className="text-2xl font-light text-foreground">{urgesThisWeek}</span>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center flex flex-col justify-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Success Rate</p>
          {hasEnoughForSuccessRate ? (
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-2xl font-light text-primary">{successRate}</span>
              <span className="text-sm text-primary">%</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground italic leading-tight">After 7 days</span>
          )}
        </div>
      </motion.div>

      {!hasEnoughForSuccessRate && (
        <motion.div variants={fadeUp} className="-mt-6 mb-8">
          <EmptyHint>Check back after 7 days of logging to see your success rate.</EmptyHint>
        </motion.div>
      )}

      {/* AI Coach */}
      <AICoachPanel
        input={{
          streak,
          successRate: hasEnoughForSuccessRate ? successRate : null,
          urgesThisWeek,
          topTriggers,
          peakLabel,
          totalRelapses,
          totalResisted,
          daysOfData,
          journalSnippets,
          urgeWeekdayDistribution,
        }}
      />

      {/* Top Triggers */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-lg font-semibold text-foreground">Top Triggers</h3>
        </div>
        {topTriggers.length > 0 ? (
          <div className="space-y-4">
            {topTriggers.map((t) => (
              <div key={t.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{t.label}</span>
                  <span className="text-sm text-primary">{t.pct}%</span>
                </div>
                <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint>Your top triggers will appear here as you log urges.</EmptyHint>
        )}
      </motion.div>

      {/* Time Pattern */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-lg font-semibold text-foreground">Time Pattern</h3>
        </div>
        <div className="bg-secondary rounded-2xl p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center mb-4">
            <PeakIcon size={28} className="text-primary" />
          </div>
          {hasEnoughForPeak ? (
            <p className="text-sm text-muted-foreground">Urges peak at {peakLabel}.</p>
          ) : (
            <EmptyHint>Log a few urges to see time patterns.</EmptyHint>
          )}
        </div>
      </motion.div>

      {/* Personalized Insight */}
      {hasEnoughForPeak && (
        <motion.div variants={fadeUp} className="bg-secondary rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs">◉</span>
            </div>
            <p className="text-sm font-semibold text-foreground">Personalized Insight</p>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{recommendation.text}</p>
          <div className="bg-background rounded-xl px-4 py-2.5">
            <p className="text-xs text-foreground">{recommendation.tip}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InsightsScreen;
