import { X, Moon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const InsightsScreen = () => {
  const { streak } = useAppStore();

  const topTriggers = [
    { label: 'Boredom', pct: 40 },
    { label: 'Late night', pct: 30 },
    { label: 'Stress', pct: 20 },
  ];

  const urgesThisWeek = 12;
  const successRate = 75;

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-32 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button className="text-muted-foreground">
          <X size={20} />
        </button>
        <h1 className="font-display text-sm tracking-widest text-primary">REFORGED</h1>
        <div className="w-5" />
      </div>

      <h2 className="text-3xl font-display tracking-wider text-foreground text-center mb-1">
        Recovery
      </h2>
      <h2 className="text-3xl font-display tracking-wider text-foreground text-center mb-8">
        Insights
      </h2>

      {/* Peak Insight Card */}
      <div className="bg-secondary rounded-2xl p-5 mb-5 relative overflow-hidden">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2 font-semibold">
          Peak Insight
        </p>
        <p className="text-foreground text-lg font-medium leading-snug">
          You're strongest<br />in the morning
        </p>
        {/* Decorative gradient */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 blur-sm" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
            Current Streak
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-light text-foreground">{streak}</span>
            <span className="text-xs text-primary font-display">Days</span>
          </div>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
            Urges This Week
          </p>
          <span className="text-2xl font-light text-foreground">{urgesThisWeek}</span>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
            Success Rate
          </p>
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
        <div className="space-y-4">
          {topTriggers.map((t) => (
            <div key={t.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-foreground">{t.label}</span>
                <span className="text-sm text-primary">{t.pct}%</span>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Pattern */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-lg font-semibold text-foreground">Time Pattern</h3>
        </div>
        <div className="bg-secondary rounded-2xl p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center mb-4">
            <Moon size={28} className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Urges peak at night.</p>
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
        <p className="text-sm text-muted-foreground mb-3">
          You struggle most after 11PM.
        </p>
        <div className="bg-background rounded-xl px-4 py-2.5">
          <p className="text-xs text-foreground">Avoid phone use after 10:30 PM.</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsScreen;
