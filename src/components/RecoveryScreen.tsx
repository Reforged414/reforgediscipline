import { Heart } from 'lucide-react';

interface RecoveryScreenProps {
  onContinue: () => void;
}

const RecoveryScreen = ({ onContinue }: RecoveryScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 animate-fade-in">
      <h1 className="font-display text-lg tracking-widest text-primary mb-12">REFORGED</h1>

      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
        <Heart size={36} className="text-primary" />
      </div>

      <h2 className="font-display text-3xl tracking-wider text-foreground text-center mb-4">
        SETBACK LOGGED
      </h2>

      <p className="text-muted-foreground text-sm text-center max-w-xs mb-2">
        This doesn't erase your progress. You're still building discipline.
      </p>
      <p className="text-muted-foreground/70 text-xs text-center max-w-xs mb-12">
        Your streak restarts today. Let's build it back stronger.
      </p>

      <p className="text-primary text-sm font-semibold mb-16">+2 XP</p>

      <button
        onClick={onContinue}
        className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider active:scale-[0.98] transition-transform"
      >
        CONTINUE FORWARD
      </button>
    </div>
  );
};

export default RecoveryScreen;
