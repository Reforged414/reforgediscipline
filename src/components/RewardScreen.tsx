import { CheckCircle } from 'lucide-react';

interface RewardScreenProps {
  streak: number;
  onContinue: () => void;
}

const RewardScreen = ({ streak, onContinue }: RewardScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 animate-fade-in">
      {/* Brand */}
      <h1 className="font-display text-lg tracking-widest text-primary mb-12">REFORGED</h1>

      {/* Title */}
      <h2 className="font-display text-3xl tracking-wider text-foreground text-center mb-2">
        YOU STAYED IN CONTROL
      </h2>
      <p className="text-muted-foreground text-xs tracking-widest uppercase mb-12">
        Resistance is Mastery
      </p>

      {/* Check icon with ring */}
      <div className="relative w-36 h-36 mb-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
          <circle
            cx="75" cy="75" r="68"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="3"
          />
          <circle
            cx="75" cy="75" r="68"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 68}
            strokeDashoffset={0}
            style={{ filter: 'drop-shadow(0 0 10px hsl(25 95% 53% / 0.6))' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle size={48} className="text-primary" />
        </div>
      </div>

      {/* Points */}
      <p className="text-muted-foreground text-xs tracking-widest uppercase mb-2">
        Your discipline is growing.
      </p>
      <h3 className="font-display text-4xl text-primary tracking-wider mb-6">
        +10 DISCIPLINE<br />POINTS
      </h3>

      {/* Streak */}
      <p className="text-5xl font-light text-foreground mb-1">{streak}</p>
      <p className="text-muted-foreground text-xs tracking-widest uppercase mb-16">
        DAYS CLEAN STREAK
      </p>

      {/* Continue */}
      <button
        onClick={onContinue}
        className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider active:scale-[0.98] transition-transform"
      >
        CONTINUE
      </button>
    </div>
  );
};

export default RewardScreen;
