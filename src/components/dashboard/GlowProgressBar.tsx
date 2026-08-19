import { motion } from 'framer-motion';

interface GlowProgressBarProps {
  /** 0-100 */
  value: number;
  /** Track height in px */
  height?: number;
  className?: string;
}

const GlowProgressBar = ({ value, height = 10, className = '' }: GlowProgressBarProps) => {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={`relative w-full bg-secondary rounded-full overflow-hidden ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="relative h-full rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(38 96% 60%) 100%)',
          boxShadow: '0 0 10px hsl(var(--primary) / 0.45)',
        }}
      >
        {/* Slow shimmer sweep */}
        <div className="absolute inset-0 progress-shimmer pointer-events-none" />
      </motion.div>

      {/* Leading-edge glow */}
      {pct > 0 && (
        <motion.div
          className="absolute top-1/2 pointer-events-none"
          initial={{ left: '0%' }}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: height * 2.4,
            height: height * 2.4,
            marginLeft: -height * 1.2,
            marginTop: -height * 1.2,
            borderRadius: '9999px',
            background:
              'radial-gradient(circle, hsl(38 100% 65% / 0.85) 0%, hsl(var(--primary) / 0.35) 45%, transparent 70%)',
            filter: 'blur(3px)',
          }}
        />
      )}
    </div>
  );
};

export default GlowProgressBar;
