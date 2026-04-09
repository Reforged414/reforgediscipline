import { X, Moon, Sun, Cloud } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const InsightsScreen = () => {
  const { streak, urgeLogs, relapseLogs, resistedTimestamps } = useAppStore();

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
  [...urgeLogs, ...relapseLogs].forEach((log) => {
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

  // Time pattern: group urges by period
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

  const peakInsight = urgeLogs.length > 0
    ? `You're most vulnerable at ${peakLabel}`
    : "You're strongest in the morning";

  const recommendation = peakLabel === 'night'
    ? { text: 'You struggle most after 11PM.', tip: 'Avoid phone use after 10:30 PM.' }
    : peakLabel === 'morning'
    ? { text: 'Mornings are your challenge.', tip: 'Start your day with a cold shower or exercise.' }
    : { text: 'Afternoons are your weak spot.', tip: 'Fill your afternoons with productive activities.' };

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-32 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button className="text-muted-foreground"><X size={20} /></button>
        <h1 className="font-display text-sm tracking-widest text-primary">REFORGED</h1>
        <div className="w-5" />
      </div>

      <h2 className="text-3xl font-display tracking-wider text-foreground text-center mb-1">Recovery</h2>
      <h2 className="text-3xl font-display tracking-wider text-foreground text-center mb-8">Insights</h2>

      {/* Peak Insight */}
      <div className="bg-secondary rounded-2xl p-5 mb-5 relative overflow-hidden">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2 font-semibold">Peak Insight</p>
        <p className="text-foreground text-lg font-medium leading-snug">{peakInsight}</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-sm" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
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
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Success Rate</p>
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-2xl font-light text-primary">{successRate}</span>
            <span className="text-sm text-primary">%</span>
          </div>
        </div>
      </div>

      {/* Top Triggers */}
      <div className="mb-8">
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
                  <div className="h-full bg-primary rounded-full" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data yet. Log urges to see your patterns.</p>
        )}
      </div>

      {/* Time Pattern */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-lg font-semibold text-foreground">Time Pattern</h3>
        </div>
        <div className="bg-secondary rounded-2xl p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center mb-4">
            <PeakIcon size={28} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            {urgeLogs.length > 0 ? `Urges peak at ${peakLabel}.` : 'Log urges to see time patterns.'}
          </p>
        </div>
      </div>

      {/* Personalized Insight */}
      <div className="bg-secondary rounded-2xl p-5 border border-primary/20">
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
      </div>
    </div>
  );
};

export default InsightsScreen;
