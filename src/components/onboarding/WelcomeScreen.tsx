import { Flame } from 'lucide-react';
import ContinueButton from './ContinueButton';
import OnboardingHeader from './OnboardingHeader';

interface Props {
  onNext: () => void;
}

const WelcomeScreen = ({ onNext }: Props) => (
  <div className="min-h-screen flex flex-col">
    <OnboardingHeader step={1} total={6} onBack={() => {}} hideBack />

    {/* Content */}
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-secondary border border-border flex items-center justify-center mb-10">
        <Flame className="h-9 w-9 text-primary" strokeWidth={1.5} />
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
