import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import AchievementIcon from './achievements/AchievementIcon';
import { sessionUnlockedIds } from '@/hooks/useAchievements';
import type { Achievement } from '@/lib/achievements';

const AchievementsScreen = ({
  achievements,
  onBack,
}: {
  achievements: Achievement[];
  onBack: () => void;
}) => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="flex items-center gap-3 px-6 pt-6 pb-6">
        <button onClick={onBack} className="text-foreground p-1" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-xl tracking-wide text-foreground">All Achievements</h1>
      </div>

      <div className="px-6 space-y-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              a.unlocked ? 'bg-primary/10 border-primary/40' : 'bg-card border-border'
            }`}
          >
            <AchievementIcon
              icon={a.icon}
              unlocked={a.unlocked}
              celebrate={a.unlocked && sessionUnlockedIds.has(a.id)}
            />
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-bold tracking-wide ${
                  a.unlocked ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {a.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>

              {!a.unlocked && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground tracking-wide">
                      {a.progress}/{a.target} {a.unit}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">{a.progressPct}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-border/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${a.progressPct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 + i * 0.04 }}
                    />
                  </div>
                </div>
              )}
            </div>
            {a.unlocked && (
              <span className="text-[10px] text-primary font-bold tracking-widest">UNLOCKED</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsScreen;
