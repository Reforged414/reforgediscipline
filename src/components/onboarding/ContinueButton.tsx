import { motion } from 'framer-motion';

interface ContinueButtonProps {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}

const ContinueButton = ({ label = 'Continue →', disabled = false, onClick }: ContinueButtonProps) => (
  <motion.div
    className="px-5 pb-8 pt-4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
  >
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className="w-full py-4 rounded-xl font-display text-lg tracking-wider text-primary-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: disabled
          ? 'hsl(25 95% 53% / 0.4)'
          : 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))',
      }}
    >
      {label}
    </motion.button>
  </motion.div>
);

export default ContinueButton;
