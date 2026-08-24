import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Brain,
  Shield,
  Target,
  Loader2,
  RefreshCw,
  HeartPulse,
  AlertTriangle,
  Globe,
  Smartphone,
  CalendarClock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from './PaywallModal';
import type { ShieldLayer } from '@/lib/shieldSuggestion';

interface JournalSnippet {
  text: string;
  tag: string | null;
  weekday: string;
  hour: number;
}

interface CoachInput {
  streak: number;
  successRate: number | null;
  urgesThisWeek: number;
  topTriggers: { label: string; pct: number }[];
  peakLabel: string;
  totalRelapses: number;
  totalResisted: number;
  daysOfData: number;
  journalSnippets?: JournalSnippet[];
  urgeWeekdayDistribution?: Record<string, number>;
}

export interface RiskWindow {
  /** e.g. "9-11 PM" */
  rangeLabel: string;
  /** e.g. "weekdays" or "Saturdays" */
  dayLabel: string;
}

interface CoachOutput {
  tactical: string;
  predictive: string;
  strategic: string;
  emotional: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const SAMPLE: CoachOutput = {
  tactical: 'Your data shows stress and boredom dominating your urge triggers. Late-night hours are when your guard drops fastest.',
  predictive: 'Based on your pattern, the next 48 hours after 10PM are your highest-risk window. Weekends amplify it.',
  strategic: 'Start a Ride the Urge timer the moment a trigger hits. Lock Reforged Shield before 9PM tonight.',
  emotional: 'Your recent journals show recurring stress and fatigue markers clustered on weeknights, directly preceding the urge spikes the next morning. You are using the urge as a release valve for unprocessed tension. Name the emotion in your Journal before it becomes a craving.',
};

/** Split an AI paragraph into 2-4 short, scannable bullets. */
function toBullets(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 4);
}

const RISK_WORDS = /risk|avoid|warning|weak|struggl|drop|fail|relaps|danger|vulnerab|trigger/i;

const AICoachPanel = ({
  input,
  riskWindow,
  onSchedule,
}: {
  input: CoachInput;
  riskWindow?: RiskWindow | null;
  onSchedule?: (layer: ShieldLayer) => void;
}) => {
  const { isPremium } = usePremium();
  const [data, setData] = useState<CoachOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const fetchCoach = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke('ai-coach', {
        body: input,
      });
      if (fnErr) throw fnErr;
      if (res?.tactical && res?.predictive && res?.strategic) {
        setData({ emotional: SAMPLE.emotional, ...(res as CoachOutput) });
      } else {
        throw new Error('Invalid response');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load coach insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium && !data && !loading) fetchCoach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);

  const CardShell = ({
    icon: Icon,
    title,
    accent,
    premium,
    children,
  }: {
    icon: typeof Brain;
    title: string;
    accent: string;
    premium?: boolean;
    children: React.ReactNode;
  }) => {
    const inner = (
      <div className="bg-background/70 rounded-[15px] p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}20`, color: accent }}
          >
            <Icon size={14} />
          </div>
          <p className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: accent }}>
            {title}
          </p>
        </div>
        {children}
      </div>
    );
    if (premium) return <div className="premium-border">{inner}</div>;
    return <div className="rounded-2xl border border-border overflow-hidden">{inner}</div>;
  };

  const BulletList = ({ text }: { text: string }) => (
    <ul className="space-y-2">
      {toBullets(text).map((b, i) => {
        const isRisk = RISK_WORDS.test(b);
        const Icon = isRisk ? AlertTriangle : Target;
        return (
          <li key={i} className="flex items-start gap-2">
            <Icon
              size={13}
              className={`mt-[3px] shrink-0 ${isRisk ? 'text-destructive' : 'text-primary'}`}
            />
            <span className="text-sm text-foreground leading-snug">{b}</span>
          </li>
        );
      })}
    </ul>
  );

  const PredictiveBody = () => {
    if (!riskWindow) {
      return (
        <>
          <p className="text-sm text-foreground leading-relaxed">{(data ?? SAMPLE).predictive}</p>
          <p className="text-[11px] text-muted-foreground mt-3">
            Log a few more urges to pinpoint your exact risk window.
          </p>
        </>
      );
    }
    return (
      <>
        <p className="text-sm text-foreground leading-snug">
          Your risk window is typically{' '}
          <span className="text-primary font-semibold">{riskWindow.rangeLabel}</span> on{' '}
          {riskWindow.dayLabel}. Consider scheduling Shield protection.
        </p>
        <div className="grid grid-cols-1 gap-2 mt-3">
          <button
            onClick={() => onSchedule?.('websites')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/15 text-primary text-xs tracking-wide font-semibold active:scale-[0.98] transition-transform"
          >
            <Globe size={14} />
            Schedule Website Blocking
            <CalendarClock size={13} className="ml-auto opacity-70" />
          </button>
          <button
            onClick={() => onSchedule?.('apps')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-xs tracking-wide font-semibold active:scale-[0.98] transition-transform"
          >
            <Smartphone size={14} />
            Schedule App Blocking
            <CalendarClock size={13} className="ml-auto opacity-70" />
          </button>
        </div>
      </>
    );
  };

  return (
    <motion.div variants={fadeUp} className="mb-8 relative">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="text-lg font-semibold text-foreground">Reforged AI Coach</h3>
        {isPremium && !loading && (
          <button
            onClick={fetchCoach}
            className="ml-auto text-muted-foreground hover:text-primary transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="premium-border" style={{ boxShadow: '0 0 32px -8px hsl(25 95% 53% / 0.35)' }}>
        <div className="rounded-[15px] bg-secondary p-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-4 relative">
            <Sparkles size={16} className="text-primary" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold">
              AI Analysis · Live
            </p>
          </div>

          <div className={`space-y-3 relative ${!isPremium ? 'blur-md select-none pointer-events-none' : ''}`}>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">Analyzing your patterns…</span>
              </div>
            ) : error ? (
              <div className="text-sm text-muted-foreground py-4">
                {error}{' '}
                <button onClick={fetchCoach} className="text-primary underline">
                  Retry
                </button>
              </div>
            ) : (
              <>
                <CardShell icon={Brain} title="Weekly Tactical Breakdown" accent="hsl(25 95% 53%)" premium>
                  <BulletList text={(data ?? SAMPLE).tactical} />
                </CardShell>
                <CardShell icon={Shield} title="Predictive Shield Warning" accent="hsl(0 80% 60%)" premium>
                  <PredictiveBody />
                </CardShell>
                <CardShell icon={Target} title="Strategic Action Plan" accent="hsl(140 70% 50%)">
                  <p className="text-sm text-foreground leading-relaxed">{(data ?? SAMPLE).strategic}</p>
                </CardShell>
                <CardShell
                  icon={HeartPulse}
                  title="Emotional Syntax & Mood Analysis"
                  accent="hsl(320 75% 60%)"
                >
                  <p className="text-sm text-foreground leading-relaxed">{(data ?? SAMPLE).emotional}</p>
                </CardShell>
              </>
            )}
          </div>

          {!isPremium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <Lock size={20} className="text-primary" />
              </div>
              <p className="font-display text-lg tracking-wide text-foreground mb-1">
                Unlock AI Insights
              </p>
              <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                Get personalized weekly breakdowns, predictive warnings, and tactical action plans powered by your data.
              </p>
              <button
                onClick={() => setShowPaywall(true)}
                className="px-6 py-2.5 rounded-xl font-display text-sm tracking-wider text-primary-foreground"
                style={{
                  background: 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))',
                  boxShadow: '0 10px 24px -10px hsl(25 95% 53% / 0.6)',
                }}
              >
                UNLOCK WITH PREMIUM
              </button>
            </div>
          )}
        </div>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason="Unlock your personal AI Recovery Coach and tactical weekly breakdowns."
        extraFeatures={[
          { label: 'Reforged AI Coach', desc: 'Tactical, predictive, and strategic insights from your data.' },
          { label: 'Emotional Syntax Analysis', desc: 'AI scans your journals for mood patterns and links them to urge spikes.' },
        ]}
      />
    </motion.div>
  );
};

export default AICoachPanel;
