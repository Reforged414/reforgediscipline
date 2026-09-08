import { useEffect, useMemo, useState } from 'react';
import { Settings, Flame, Shield, BookOpen, RotateCcw, Pencil, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CountUpNumber from '@/components/dashboard/CountUpNumber';
import AchievementsScreen from './AchievementsScreen';
import AchievementIcon from './achievements/AchievementIcon';
import { computeAchievements, type Achievement } from '@/lib/achievements';
import { sessionUnlockedIds } from '@/hooks/useAchievements';

const MOTTO_KEY = 'reforged-motto';

interface ProfileProps {
  onOpenSettings?: () => void;
}

const ProfilePlaceholder = ({ onOpenSettings }: ProfileProps) => {
  const store = useAppStore();
  const { streak, xp, level, resistedTimestamps, journalLogs, relapseLogs, onboardingData } = store;
  const { user, isGuest } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const username = useMemo(() => {
    if (isGuest) return 'reforged_warrior';
    const meta: any = user?.user_metadata || {};
    return (
      meta.username ||
      meta.preferred_username ||
      meta.full_name?.toLowerCase().replace(/\s+/g, '_') ||
      user?.email?.split('@')[0] ||
      'reforged_warrior'
    );
  }, [user, isGuest]);

  const initial = username.charAt(0).toUpperCase();

  const joinDate = useMemo(() => {
    const dateStr = user?.created_at;
    const d = dateStr ? new Date(dateStr) : new Date();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [user]);

  const quote = useMemo(() => {
    const goals = onboardingData?.goals || [];
    const identity = onboardingData?.identity || [];
    if (goals.includes('quit')) return 'Breaking free, one day at a time';
    if (goals.includes('control') || identity.includes('self-control')) return 'Rebuilding control daily';
    if (goals.includes('discipline') || identity.includes('disciplined')) return 'Forging discipline daily';
    if (goals.includes('focus') || identity.includes('clearer-mind')) return 'Seeking clarity each day';
    if (identity.includes('confident')) return 'Forging confidence within';
    return 'One day at a time';
  }, [onboardingData]);

  const unlocked = useMemo(() => computeAchievements(store), [store]);

  const top4 = unlocked.slice(0, 4);

  if (showAll) {
    return <AchievementsScreen achievements={unlocked} onBack={() => setShowAll(false)} />;
  }

  const stats = [
    { icon: Shield, value: resistedTimestamps.length, label: 'URGES RESISTED', color: 'text-primary' },
    { icon: BookOpen, value: journalLogs.length, label: 'JOURNAL ENTRIES', color: 'text-primary' },
    { icon: RotateCcw, value: relapseLogs.length, label: 'RELAPSES LOGGED', color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="font-display text-lg tracking-widest text-primary">REFORGED</h1>
        <button onClick={onOpenSettings} className="text-primary p-1" aria-label="Settings">
          <Settings size={22} />
        </button>
      </div>

      {/* Avatar + streak header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 px-6 mb-6"
      >
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full bg-secondary border-2 border-primary flex items-center justify-center">
            <span className="font-display text-3xl text-foreground">{initial}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <Flame size={12} className="text-primary-foreground" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-primary" fill="currentColor" />
            <h2 className="font-display text-2xl tracking-wide text-foreground">{streak} Day Streak</h2>
          </div>
          <p className="text-primary text-sm font-medium mt-0.5">
            Level {level} <span className="text-muted-foreground mx-1">•</span> {xp.toLocaleString()} XP
          </p>
          <p className="text-muted-foreground italic text-xs mt-1">"{quote}"</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-6 mb-6 bg-card rounded-2xl border border-border p-5"
      >
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <s.icon size={22} className={s.color} />
              <p className="text-2xl font-light text-primary mt-3">{s.value}</p>
              <p className="text-[10px] text-muted-foreground tracking-widest mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="px-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl tracking-wide text-foreground">Achievements</h3>
          <button
            onClick={() => setShowAll(true)}
            className="text-primary text-xs font-bold tracking-widest hover:opacity-80"
          >
            VIEW ALL
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {top4.map((a) => (
            <BadgeTile key={a.id} achievement={a} />
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-10 px-6">
        <p className="text-foreground text-sm">{username}</p>
        <p className="text-muted-foreground text-[10px] tracking-widest mt-1">INITIATED {joinDate}</p>
      </div>
    </div>
  );
};

const BadgeTile = ({ achievement }: { achievement: Achievement }) => {
  return (
    <div
      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-3 ${
        achievement.unlocked ? 'bg-primary/15 border border-primary/40' : 'bg-secondary/50 border border-border'
      }`}
    >
      <AchievementIcon
        icon={achievement.icon}
        unlocked={achievement.unlocked}
        celebrate={achievement.unlocked && sessionUnlockedIds.has(achievement.id)}
      />
      <p
        className={`text-[10px] tracking-widest text-center mt-3 leading-tight ${
          achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        {achievement.label}
      </p>
      {!achievement.unlocked && (
        <>
          <p className="text-[9px] text-muted-foreground/70 mt-1">
            {achievement.progress}/{achievement.target} {achievement.unit}
          </p>
          <div className="mt-1.5 h-1 w-14 rounded-full bg-border/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${achievement.progressPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePlaceholder;
