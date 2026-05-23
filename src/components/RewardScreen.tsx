import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RewardScreenProps {
  streak: number;
  onContinue: () => void;
  title?: string;
  subtitle?: string;
  xp?: number;
  showStreak?: boolean;
}

const RewardScreen = ({
  streak,
  onContinue,
  title = 'YOU STAYED IN CONTROL',
  subtitle = 'Resistance is Mastery',
  xp = 15,
  showStreak = true,
}: RewardScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 animate-fade-in">
      <h1 className="font-display text-lg tracking-widest text-primary mb-12">REFORGED</h1>

      <h2 className="font-display text-3xl tracking-wider text-foreground text-center mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground text-xs tracking-widest uppercase mb-12">
        {subtitle}
      </p>

      <div className="relative w-36 h-36 mb-10">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="68" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
          <motion.circle
            cx="75" cy="75" r="68"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 68}
            initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 0 10px hsl(25 95% 53% / 0.6))' }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 240, damping: 14 }}
        >
          <CheckCircle size={48} className="text-primary" />
        </motion.div>
      </div>

      <p className="text-muted-foreground text-xs tracking-widest uppercase mb-2">
        Your discipline is growing.
      </p>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="font-display text-4xl text-primary tracking-wider mb-6 text-center"
      >
        +{xp} DISCIPLINE<br />POINTS
      </motion.h3>

      {showStreak && (
        <>
          <p className="text-5xl font-light text-foreground mb-1">{streak}</p>
          <p className="text-muted-foreground text-xs tracking-widest uppercase mb-16">
            DAYS CLEAN STREAK
          </p>
        </>
      )}

      <button
        onClick={onContinue}
        className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider active:scale-[0.98] transition-transform"
      >
        CONTINUE
      </button>
    </div>
  );
};

export default RewardScreen;
