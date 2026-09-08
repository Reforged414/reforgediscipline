import { AnimatePresence, motion } from 'framer-motion';
import AchievementIcon from './AchievementIcon';
import type { Achievement } from '@/lib/achievements';

const AchievementUnlockModal = ({
  achievement,
  onClose,
}: {
  achievement: Achievement | null;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-xs rounded-2xl border border-primary/40 bg-card p-7 text-center"
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.34, 1.4, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold tracking-[0.3em] text-primary">ACHIEVEMENT UNLOCKED</p>
            <div className="my-6 flex justify-center">
              <AchievementIcon
                icon={achievement.icon}
                unlocked
                celebrate
                size={34}
                boxClassName="w-20 h-20"
              />
            </div>
            <h2 className="font-display text-2xl tracking-wide text-foreground">{achievement.label}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{achievement.desc}</p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
            >
              Keep Going
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementUnlockModal;
