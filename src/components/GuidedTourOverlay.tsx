import { useState, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface TourStep {
  selector: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom';
  /** Main tab that must be showing for this step's target to exist. */
  tab?: string;
}

interface Rect {
  top: number; left: number; width: number; height: number;
}

const PADDING = 8;
const TIP_GAP = 12;
const SAFE_TOP = 56;
const SAFE_BOTTOM = 16;

interface GuidedTourOverlayProps {
  steps: TourStep[];
  onDone: () => void;
  onEnterStep?: (step: TourStep) => void;
}

const GuidedTourOverlay = ({ steps, onDone, onEnterStep }: GuidedTourOverlayProps) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tipH, setTipH] = useState(170);
  const tipRef = useRef<HTMLDivElement>(null);
  const onEnterRef = useRef(onEnterStep);
  onEnterRef.current = onEnterStep;

  useLayoutEffect(() => {
    const step = steps[stepIdx];
    if (!step) return;
    onEnterRef.current?.(step);

    let scrolled = false;
    const locate = () => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      if (!scrolled) {
        scrolled = true;
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    };

    locate();
    // Re-measure while tab/page transitions settle.
    const timers = [150, 400, 800, 1200].map((ms) => window.setTimeout(locate, ms));
    window.addEventListener('resize', locate);
    window.addEventListener('scroll', locate, true);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('resize', locate);
      window.removeEventListener('scroll', locate, true);
    };
  }, [steps, stepIdx]);

  // Measure the real tooltip height so it can be kept fully on screen.
  useLayoutEffect(() => {
    const h = tipRef.current?.offsetHeight;
    if (h && Math.abs(h - tipH) > 1) setTipH(h);
  }, [stepIdx, rect, tipH]);

  const step = steps[stepIdx];
  if (!step) return null;
  const isLast = stepIdx === steps.length - 1;

  const handleNext = () => {
    if (isLast) onDone();
    else setStepIdx((i) => i + 1);
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tipW = Math.min(280, vw - 32);
  const tipLeft = (vw - tipW) / 2;

  let tipTop: number;
  if (!rect) {
    tipTop = (vh - tipH) / 2;
  } else {
    const above = rect.top - TIP_GAP - tipH;
    const below = rect.top + rect.height + TIP_GAP;
    const fitsAbove = above >= SAFE_TOP;
    const fitsBelow = below + tipH <= vh - SAFE_BOTTOM;
    const preferAbove = step.placement === 'top' || (step.placement !== 'bottom' && rect.top > vh / 2);
    if (preferAbove) tipTop = fitsAbove ? above : fitsBelow ? below : above;
    else tipTop = fitsBelow ? below : fitsAbove ? above : below;
  }
  tipTop = Math.min(Math.max(tipTop, SAFE_TOP), vh - tipH - SAFE_BOTTOM);

  return (
    <AnimatePresence>
      <motion.div
        key="guided-tour"
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={handleNext}>
          <defs>
            <mask id="guided-tour-mask">
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
            mask="url(#guided-tour-mask)"
          />
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

        <motion.div
          ref={tipRef}
          key={stepIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute rounded-xl bg-card border border-primary/30 p-4 shadow-2xl"
          style={{ top: tipTop, left: tipLeft, width: tipW }}
        >
          <p className="font-display text-sm tracking-wider text-primary mb-1 uppercase">
            {step.title}
          </p>
          <p className="text-sm text-foreground/90 mb-4 leading-relaxed">
            {step.body}
          </p>
          <div className="flex items-center justify-between">
            <button
              onClick={onDone}
              className="text-xs text-muted-foreground tracking-wider uppercase hover:text-foreground transition-colors"
            >
              Skip
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground tracking-widest">
                {stepIdx + 1} / {steps.length}
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

export default GuidedTourOverlay;
