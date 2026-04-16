import { useEffect, useState, useLayoutEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface Step {
  selector: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom';
}

const STEPS: Step[] = [
  {
    selector: '[data-tutorial="daily-checkin"]',
    title: 'Daily Check-in',
    body: 'Start here every day to keep your streak alive.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="log-urge"]',
    title: 'Log Urge',
    body: 'Tap this when you feel an urge so you can track patterns.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="insights-tab"]',
    title: 'Insights',
    body: 'Your progress and patterns show up here after a few days.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="profile-tab"]',
    title: 'Profile',
    body: 'Track your XP, level, and account here.',
    placement: 'top',
  },
];

interface Rect {
  top: number; left: number; width: number; height: number;
}

const PADDING = 8;

const TutorialOverlay = () => {
  const { hasSeenTutorial, onboardingComplete, markTutorialSeen } = useAppStore();
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [active, setActive] = useState(false);

  // Activate after onboarding, slight delay so layout is ready
  useEffect(() => {
    if (!onboardingComplete || hasSeenTutorial) return;
    const t = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(t);
  }, [onboardingComplete, hasSeenTutorial]);

  useLayoutEffect(() => {
    if (!active) return;
    const step = STEPS[stepIdx];
    if (!step) return;
    const measure = () => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, stepIdx]);

  if (!active || hasSeenTutorial || !onboardingComplete) return null;

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      markTutorialSeen();
      setActive(false);
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const handleSkip = () => {
    markTutorialSeen();
    setActive(false);
  };

  // Tooltip placement
  const tooltipStyle: React.CSSProperties = (() => {
    if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const placeAbove = (step.placement === 'top') || rect.top > window.innerHeight / 2;
    if (placeAbove) {
      return {
        top: Math.max(16, rect.top - 12),
        left: '50%',
        transform: 'translate(-50%, -100%)',
      };
    }
    return {
      top: rect.top + rect.height + 12,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  })();

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial"
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* SVG mask for spotlight */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={handleNext}>
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left}
                  y={rect.top}
                  width={rect.width}
                  height={rect.height}
                  rx={12}
                  ry={12}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="hsl(var(--background))"
            fillOpacity="0.85"
            mask="url(#tutorial-mask)"
          />
          {/* Glow ring around target */}
          {rect && (
            <rect
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              rx={12}
              ry={12}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))' }}
            />
          )}
        </svg>

        {/* Tooltip */}
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute w-[280px] max-w-[calc(100vw-32px)] rounded-xl bg-card border border-primary/30 p-4 shadow-2xl"
          style={tooltipStyle}
        >
          <p className="font-display text-sm tracking-wider text-primary mb-1 uppercase">
            {step.title}
          </p>
          <p className="text-sm text-foreground/90 mb-4 leading-relaxed">
            {step.body}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground tracking-wider uppercase hover:text-foreground transition-colors"
            >
              Skip
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground tracking-widest">
                {stepIdx + 1} / {STEPS.length}
              </span>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-display tracking-wider uppercase"
              >
                {isLast ? 'Done' : 'Next'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialOverlay;
