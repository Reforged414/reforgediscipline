import { motion } from 'framer-motion';

interface Props {
  icon: any;
  unlocked: boolean;
  celebrate?: boolean;
  size?: number;
  boxClassName?: string;
}

/**
 * Achievement icon: dimmed silhouette when locked, full orange when unlocked.
 * When `celebrate` is true it plays a scale-bounce plus a radial glow burst.
 */
const AchievementIcon = ({ icon: Icon, unlocked, celebrate, size = 22, boxClassName = 'w-12 h-12' }: Props) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${boxClassName}`}>
      {celebrate && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full bg-primary/50 blur-xl"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.4, 2.2, 2.6] }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      )}
      <motion.div
        className={`relative w-full h-full rounded-lg flex items-center justify-center ${
          unlocked ? 'bg-primary' : 'bg-secondary'
        }`}
        initial={celebrate ? { scale: 0.8 } : false}
        animate={celebrate ? { scale: [0.8, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Icon
          size={size}
          className={unlocked ? 'text-primary-foreground' : 'text-muted-foreground/50 grayscale'}
          strokeWidth={unlocked ? 2 : 1.5}
        />
      </motion.div>
    </div>
  );
};

export default AchievementIcon;
