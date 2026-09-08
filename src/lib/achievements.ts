import { Flame, NotebookPen, ShieldCheck, Lock, Sparkles, Trophy, Crown, Zap } from 'lucide-react';

export interface AchievementDef {
  id: string;
  label: string;
  desc: string;
  icon: any;
  /** Current progress value for the user */
  current: (s: any) => number;
  /** Value required to unlock */
  target: number;
  /** Unit shown in progress subtext, e.g. "days" */
  unit: string;
}

export interface Achievement extends AchievementDef {
  unlocked: boolean;
  progress: number;
  progressPct: number;
}

const streak = (s: any) => s.streak ?? 0;
const resisted = (s: any) => s.resistedTimestamps?.length ?? 0;
const journals = (s: any) => s.journalLogs?.length ?? 0;

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: '3day', label: '3 DAY STREAK', desc: 'Reach a 3-day streak', icon: Flame, current: streak, target: 3, unit: 'days' },
  { id: 'firstweek', label: 'FIRST WEEK COMPLETED', desc: 'Reach a 7-day streak', icon: Sparkles, current: streak, target: 7, unit: 'days' },
  { id: '30day', label: '30 DAY TITAN', desc: 'Reach a 30-day streak', icon: Trophy, current: streak, target: 30, unit: 'days' },
  { id: 'journalist', label: 'JOURNALIST MASTER', desc: 'Write 10 journal entries', icon: NotebookPen, current: journals, target: 10, unit: 'entries' },
  { id: '60day', label: '60 DAY WARRIOR', desc: 'Reach a 60-day streak', icon: Zap, current: streak, target: 60, unit: 'days' },
  { id: '90day', label: '90 DAY LEGEND', desc: 'Reach a 90-day streak', icon: Crown, current: streak, target: 90, unit: 'days' },
  { id: 'urge25', label: 'URGE CRUSHER', desc: 'Resist 25 urges', icon: ShieldCheck, current: resisted, target: 25, unit: 'urges' },
  { id: 'urge100', label: 'IRON WILL', desc: 'Resist 100 urges', icon: Lock, current: resisted, target: 100, unit: 'urges' },
];

export const computeAchievements = (state: any): Achievement[] =>
  ACHIEVEMENT_DEFS.map((def) => {
    const progress = Math.max(0, def.current(state));
    const unlocked = progress >= def.target;
    return {
      ...def,
      progress: Math.min(progress, def.target),
      unlocked,
      progressPct: Math.min(100, Math.round((progress / def.target) * 100)),
    };
  });
