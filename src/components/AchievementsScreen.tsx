import { ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: any;
  unlocked: boolean;
}

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
        {achievements.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={`flex items-center gap-4 p-4 rounded-xl border ${
                a.unlocked
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-card border-border'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  a.unlocked ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                {a.unlocked ? (
                  <Icon size={22} className="text-primary-foreground" />
                ) : (
                  <Lock size={18} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold tracking-wide ${
                    a.unlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {a.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
              {a.unlocked && (
                <span className="text-[10px] text-primary font-bold tracking-widest">UNLOCKED</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsScreen;
