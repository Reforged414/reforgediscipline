import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingHeaderProps {
  step: number;
  total: number;
  onBack: () => void;
  editMode?: boolean;
}

const OnboardingHeader = ({ step, total, onBack, editMode }: OnboardingHeaderProps) => {
  const pct = Math.max(0, Math.min(100, (step / total) * 100));
  return (
    <div className="pt-6 pb-4 px-5">
      <div className="relative flex items-center justify-center mb-3">
        <button onClick={onBack} className="absolute left-0 text-foreground">
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-display">
            {editMode ? 'Edit Answer' : 'Onboarding'}
          </p>
          {!editMode && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Step {step} of {total}
            </p>
          )}
        </div>
      </div>
      {!editMode && (
        <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(25 95% 53%), hsl(30 100% 60%))' }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      )}
    </div>
  );
};

export default OnboardingHeader;
