import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function WelcomeGate({ onGetStarted, onSignIn }: Props) {
  const [leaving, setLeaving] = useState(false);

  const handleGetStarted = () => {
    if (leaving) return;
    setLeaving(true);
    // Wait for exit animation before advancing
    window.setTimeout(() => onGetStarted(), 650);
  };

  return (
    <AnimatePresence mode="wait">
      {!leaving ? (
        <motion.div
          key="welcome"
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="flex min-h-screen flex-col items-center justify-between bg-background p-6 text-foreground"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative mb-10"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30 blur-3xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative rounded-2xl bg-primary/10 p-5">
                <Flame className="h-14 w-14 text-primary drop-shadow-[0_0_20px_hsl(25_95%_53%/0.6)]" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="font-display text-5xl tracking-[0.15em] uppercase text-foreground mb-4"
            >
              Welcome to<br />Reforged
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="text-base text-muted-foreground leading-relaxed max-w-xs"
            >
              Ready to start your recovery journey?
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
            className="w-full max-w-md space-y-4 pb-6"
          >
            <motion.button
              onClick={handleGetStarted}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-4 font-display text-lg tracking-wider text-primary-foreground"
              style={{ background: 'linear-gradient(135deg, hsl(25 95% 53%), hsl(30 100% 60%))' }}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            <button
              type="button"
              onClick={onSignIn}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Already have an account?{' '}
              <span className="text-primary font-medium">Sign In</span>
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 flex items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/40 blur-3xl"
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Flame className="relative h-20 w-20 text-primary drop-shadow-[0_0_30px_hsl(25_95%_53%/0.8)]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
