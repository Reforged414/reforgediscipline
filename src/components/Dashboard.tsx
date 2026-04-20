import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import RetentionBanner from '@/components/RetentionBanner';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

interface DashboardProps {
  onRideUrge?: () => void;
  onLogUrge?: () => void;
  onDailyCheckIn?: () => void;
  onJournal?: () => void;
  onOpenSettings?: () => void;
}

const Dashboard = ({ onRideUrge, onLogUrge, onDailyCheckIn, onJournal, onOpenSettings }: DashboardProps) => {
  const { streak, xp, level, levelName, xpForNextLevel, dailyDiscipline, checkNewDay, urgeLogs, relapseLogs } = useAppStore();

  React.useEffect(() => {
    checkNewDay();
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
    return `Day ${streak} — streak locked in. Come back tomorrow.`;
  }, [streak, dailyDiscipline.checkedIn]);

  const prevLevelXp = xpForNextLevel - 1000;
  const xpProgress = Math.min(((xp - Math.max(prevLevelXp, 0)) / (xpForNextLevel - Math.max(prevLevelXp, 0))) * 100, 100);

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
        <button onClick={onOpenSettings} aria-label="Settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings size={20} />
        </button>
      </motion.div>

      {/* Retention Banner */}
      <motion.div variants={fadeUp}>
        <RetentionBanner />
      </motion.div>

      {/* Streak */}
      <motion.div variants={fadeUp} className="text-center mb-10">
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mb-2">Current Streak</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-7xl font-light text-foreground">{streak}</span>
          <span className="text-3xl font-display text-primary">Days</span>
        </div>
        <p className="text-4xl font-light text-foreground -mt-1">Clean</p>
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mt-3">Your discipline is growing.</p>
      </motion.div>

      {/* Level */}
      <motion.div variants={fadeUp} className="mb-10">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-lg italic text-foreground">
            <span className="font-semibold">Level {level}</span> – {levelName}
          </p>
          <p className="text-[10px] text-muted-foreground tracking-wider">{xp} / {xpForNextLevel} XP</p>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            style={{ boxShadow: '0 0 10px hsl(25 95% 53% / 0.5)' }}
          />
        </div>
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
            className="w-full py-4 rounded-xl bg-primary text-center"
            whileTap={{ scale: 0.97 }}
          >
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
            className="w-full py-4 rounded-xl border border-border text-center"
            whileTap={{ scale: 0.97 }}
          >
            <span className="font-display text-sm tracking-wider text-foreground">LOG URGE</span>
          </motion.button>
          <p className="text-center text-[11px] text-muted-foreground mt-1.5">
            Record an urge you experienced
          </p>
        </div>
      </motion.div>

      {/* Daily Discipline */}
      <motion.div variants={fadeUp} className="mb-8" data-tutorial="daily-checkin">
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Daily Discipline</p>
        <div className="space-y-3">
          {[
            { label: 'Daily check-in', xp: '+15 XP', done: dailyDiscipline.checkedIn, action: onDailyCheckIn },
            { label: 'Resist one urge', xp: '+10 XP', done: dailyDiscipline.resistedUrge },
            { label: 'Write a reflection', xp: '+10 XP', done: dailyDiscipline.wroteReflection, action: onJournal },
          ].map((task) => (
            <div
              key={task.label}
              onClick={task.action && !task.done ? task.action : undefined}
              className={`flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 ${
                task.action && !task.done ? 'cursor-pointer active:scale-[0.97] transition-transform' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                task.done ? 'bg-primary border-primary animate-glow-once' : 'border-muted-foreground/40'
              }`}>
                {task.done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-check-pop">
                    <path d="M2 6L5 9L10 3" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className={`flex-1 text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.label}
              </span>
              <span className="text-primary text-xs">{task.xp}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Next Milestone */}
      <motion.div variants={fadeUp} className="bg-secondary rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Next Milestone</p>
          <p className="text-lg italic text-foreground font-semibold">
            {streak < 21 ? '21' : streak < 60 ? '60' : '90'} Days Clean
          </p>
        </div>
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((streak / (streak < 21 ? 21 : streak < 60 ? 60 : 90)) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
