import { ArrowLeft } from 'lucide-react';

interface OnboardingHeaderProps {
  step: number;
  total: number;
  onBack: () => void;
}

const OnboardingHeader = ({ step, total, onBack }: OnboardingHeaderProps) => (
  <div className="relative flex items-center justify-center pt-6 pb-4 px-5">
    <button onClick={onBack} className="absolute left-5 text-foreground">
      <ArrowLeft size={22} />
    </button>
    <div className="text-center">
      <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-display">
        Onboarding
      </p>
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        Step {step} of {total}
      </p>
    </div>
  </div>
);

export default OnboardingHeader;
