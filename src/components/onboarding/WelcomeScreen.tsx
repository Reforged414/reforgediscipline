import { ArrowLeft } from 'lucide-react';
import ContinueButton from './ContinueButton';

interface Props {
  onNext: () => void;
}

const WelcomeScreen = ({ onNext }: Props) => (
  <div className="min-h-screen flex flex-col">
    {/* Header */}
    <div className="relative flex items-center justify-center pt-6 pb-4 px-5">
      <div className="text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-display">
          Onboarding
        </p>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Step 1 of 6
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mb-10">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="hsl(25 95% 53%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
        Take Back<br />Control
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Reclaim your life. Forge your<br />discipline.
      </p>
    </div>

    <ContinueButton label="Begin Journey →" onClick={onNext} />
  </div>
);

export default WelcomeScreen;
