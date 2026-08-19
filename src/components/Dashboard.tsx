import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, CheckCircle2, Shield, NotebookPen, Activity, PlusCircle } from 'lucide-react';
import { useAppStore, LEVELS, MILESTONES } from '@/store/useAppStore';
import RetentionBanner from '@/components/RetentionBanner';
import DisciplineGoals from '@/components/DisciplineGoals';
import CountUpNumber from '@/components/dashboard/CountUpNumber';
import WeekStrip from '@/components/dashboard/WeekStrip';
import HistorySection from '@/components/dashboard/HistorySection';
import GlowProgressBar from '@/components/dashboard/GlowProgressBar';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

interface DashboardProps {
  onRideUrge?: () => void;
  onLogUrge?: () => void;
  onDailyCheckIn?: () => void;
  onJournal?: () => void;
  onOpenSettings?: () => void;
}

const Dashboard = ({ onRideUrge, onLogUrge, onDailyCheckIn, onJournal, onOpenSettings }: DashboardProps) => {
  const {
    streak, xp, level, levelName, xpForNextLevel, dailyDiscipline, checkNewDay,
    urgeLogs, relapseLogs, checkInDates,
  } = useAppStore();
  const [numberLanded, setNumberLanded] = useState(false);

  React.useEffect(() => {
    checkNewDay();
    // Also roll the day over if the app stays open past midnight or is
    // resumed from the background.
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkNewDay();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [checkNewDay]);

  const insightMessage = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const hadRelapseToday = relapseLogs.some((r) => r.timestamp.split('T')[0] === today);
    if (hadRelapseToday) {
      return "Slip-ups happen. Day 1 starts now.";
    }
    const todayUrgeCount = urgeLogs.filter((u) => u.timestamp.split('T')[0] === today).length;
    if (todayUrgeCount > 0) {
      return `You've had ${todayUrgeCount} urge${todayUrgeCount > 1 ? 's' : ''} today. Stay focused.`;
    }
    return null;
  }, [urgeLogs, relapseLogs]);

  const streakStatusMessage = useMemo(() => {
    if (streak === 0 && !dailyDiscipline.checkedIn) {
      return "Complete today's check-in to start your streak";
    }
    if (!dailyDiscipline.checkedIn) {
      return 'Complete your check-in to keep your streak alive';
    }
    if (streak === 0) {
      return 'Checked in. Day 1 starts fresh tomorrow.';
    }
    return `Day ${streak} — streak locked in. Come back tomorrow.`;
  }, [streak, dailyDiscipline.checkedIn]);

  const relapseDates = useMemo(
    () => relapseLogs.map((r) => r.timestamp.split('T')[0]),
    [relapseLogs]
  );

  const currentLevelBaseXp = LEVELS[level - 1]?.xpRequired ?? 0;
  const xpProgress = Math.min(
    Math.max(((xp - currentLevelBaseXp) / (xpForNextLevel - currentLevelBaseXp)) * 100, 0),
    100
  );

  const nextMilestone = MILESTONES.find((m) => m > streak) ?? null;

  const tasks = [
    { label: 'Daily check-in', xp: '+10 XP', icon: CheckCircle2, done: dailyDiscipline.checkedIn, action: onDailyCheckIn },
    { label: 'Resist one urge', xp: '+15 XP', icon: Shield, done: dailyDiscipline.resistedUrge, action: onRideUrge },
    { label: 'Write a reflection', xp: '+15 XP', icon: NotebookPen, done: dailyDiscipline.wroteReflection, action: onJournal },
  ];

  return (
    <motion.div
      className="min-h-screen bg-background px-5 pt-12 pb-32"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-10">
        <h1 className="font-display text-xl tracking-widest text-primary">REFORGED</h1>
        <motion.button
          onClick={onOpenSettings}
          whileTap={{ scale: 0.97 }}
          aria-label="Settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={20} />
        </motion.button>
      </motion.div>

      {/* Check-in reminder (only when not checked in) */}
      <motion.div variants={fadeUp}>
        <RetentionBanner />
      </motion.div>

      {/* Streak */}
      <motion.div variants={fadeUp} className="text-center mb-8">
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mb-2">Current Streak</p>
        <div className="relative flex items-baseline justify-center gap-2">
          <div
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 55%, hsl(var(--primary) / 0.22) 0%, transparent 65%)',
            }}
          />
          <span className="text-7xl font-bold text-foreground tracking-tight">
            <CountUpNumber value={streak} duration={800} onDone={() => setNumberLanded(true)} />
          </span>
          <motion.span
            className="text-3xl font-display text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={numberLanded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            Days
          </motion.span>
        </div>
        <p className="text-4xl font-light text-foreground -mt-1">Clean</p>
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mt-3 mb-6">Your discipline is growing.</p>

        {/* 7-day consistency strip */}
        <WeekStrip checkInDates={checkInDates} />
      </motion.div>

      {/* Level */}
      <motion.div variants={fadeUp} className="mt-10 mb-10">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-lg italic text-foreground">
            <span className="font-semibold">Level {level}</span> – {levelName}
          </p>
          <p className="text-[10px] text-muted-foreground tracking-wider">{xp} / {xpForNextLevel} XP</p>
        </div>
        <GlowProgressBar value={xpProgress} height={10} />
      </motion.div>

      {/* Streak Status (subtle text below XP bar) */}
      <motion.p
        variants={fadeUp}
        className="text-center text-[11px] tracking-wide text-primary/80 -mt-6 mb-8"
      >
        {streakStatusMessage}
      </motion.p>

      {/* Dynamic Insight */}
      {insightMessage && (
        <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground italic mb-10">{insightMessage}</motion.p>
      )}

      {/* CTA Buttons */}
      <motion.div variants={fadeUp} className="space-y-4 mb-10">
        <div>
          <motion.button
            onClick={onRideUrge}
            className="cta-glow-pulse w-full py-4 rounded-full bg-primary flex items-center justify-center gap-2.5"
            whileTap={{ scale: 0.96 }}
          >
            <Activity size={20} className="text-primary-foreground" />
            <span className="font-display text-lg tracking-wider text-primary-foreground">RIDE THE URGE</span>
          </motion.button>
          <p className="text-center text-[11px] text-muted-foreground mt-1.5">
            Feel an urge? Work through it here
          </p>
        </div>
        <div>
          <motion.button
            data-tutorial="log-urge"
            onClick={onLogUrge}
            className="w-full py-4 rounded-full border border-border flex items-center justify-center gap-2.5"
            initial={{ backgroundColor: 'hsl(var(--secondary) / 0)' }}
            whileTap={{ scale: 0.96, backgroundColor: 'hsl(var(--secondary) / 0.9)' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <PlusCircle size={18} className="text-foreground" />
            <span className="font-display text-sm tracking-wider text-foreground">LOG URGE</span>
          </motion.button>
          <p className="text-center text-[11px] text-muted-foreground mt-1.5">
            Record an urge you experienced
          </p>
        </div>
      </motion.div>

      {/* Core Daily Shields */}
      <motion.div variants={fadeUp} className="mb-8" data-tutorial="daily-checkin">
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Core Daily Shields</p>
        <div className="space-y-3">
          {tasks.map(({ label, xp: xpLabel, icon: Icon, done, action }) => (
            <motion.div
              key={label}
              onClick={action && !done ? action : undefined}
              whileTap={action && !done ? { scale: 0.97 } : undefined}
              className="flex items-center gap-3 bg-secondary/70 border border-border/60 rounded-xl px-4 py-3 shadow-[0_2px_12px_hsl(0_0%_0%_/_0.35)]"
              style={action && !done ? { cursor: 'pointer' } : undefined}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  done ? 'bg-primary/25 text-primary' : 'bg-primary/10 text-primary/70'
                }`}
                style={done ? { boxShadow: '0 0 14px hsl(var(--primary) / 0.35)' } : undefined}
              >
                <Icon size={18} />
              </div>
              <span className={`flex-1 text-sm ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {label}
              </span>
              <span className="text-primary text-xs mr-1">{xpLabel}</span>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                done ? 'bg-primary border-primary animate-glow-once' : 'border-muted-foreground/40'
              }`}>
                {done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-check-pop">
                    <path d="M2 6L5 9L10 3" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* History heatmap */}
      <motion.div variants={fadeUp} className="mb-8">
        <HistorySection checkInDates={checkInDates} relapseDates={relapseDates} />
      </motion.div>

      {/* Personalized Discipline Goals */}
      <motion.div variants={fadeUp} className="mb-8">
        <DisciplineGoals />
      </motion.div>

      {/* Next Milestone */}
      <motion.div
        variants={fadeUp}
        whileTap={{ scale: 0.97 }}
        className="bg-secondary/70 border border-border/60 rounded-xl p-5 shadow-[0_2px_12px_hsl(0_0%_0%_/_0.35)]"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Next Milestone</p>
          <p className="text-lg italic text-foreground font-semibold">
            {nextMilestone ? `${nextMilestone} Days Clean` : 'Beyond 365 — Legend'}
          </p>
        </div>
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${nextMilestone ? Math.min((streak / nextMilestone) * 100, 100) : 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
