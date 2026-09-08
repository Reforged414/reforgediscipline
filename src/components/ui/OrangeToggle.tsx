import { motion } from 'framer-motion';

interface OrangeToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

/**
 * Orange-accent toggle matching the Shield screen's Protection Layer switches:
 * track fills orange when on, spring-based thumb slide, scale-pulse on tap.
 */
const OrangeToggle = ({ enabled, onToggle, disabled, 'aria-label': ariaLabel }: OrangeToggleProps) => (
  <motion.button
    type="button"
    onClick={() => !disabled && onToggle(!enabled)}
    disabled={disabled}
    whileTap={{ scale: 0.85 }}
    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${
      enabled ? 'bg-primary' : 'bg-background border border-border'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-pressed={enabled}
    aria-label={ariaLabel}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`absolute top-0.5 ${enabled ? 'right-0.5' : 'left-0.5'} w-5 h-5 rounded-full bg-foreground`}
    />
  </motion.button>
);

export default OrangeToggle;
