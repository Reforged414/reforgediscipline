import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Wind, RotateCcw, Timer, ChevronRight } from 'lucide-react';

interface EmergencyHelpProps {
  onBack: () => void;
  onRideUrge: () => void;
  onDashboard: () => void;
}

const EmergencyHelp = ({ onBack, onRideUrge, onDashboard }: EmergencyHelpProps) => {
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(60);
  const [resetMessage, setResetMessage] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (breathing && breathSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setBreathSeconds((s) => {
          if (s <= 1) {
            setBreathing(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      // 4s inhale / 4s exhale cycle
      phaseRef.current = setInterval(() => {
        setBreathPhase((p) => (p === 'inhale' ? 'exhale' : 'inhale'));
      }, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseRef.current) clearInterval(phaseRef.current);
    };
  }, [breathing, breathSeconds]);

  const startBreathing = () => {
    setBreathing(true);
    setBreathSeconds(60);
    setBreathPhase('inhale');
  };

  const handleResetFocus = () => {
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-10 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <button onClick={onBack} className="text-foreground mb-6">
        <ArrowLeft size={24} />
      </button>

      <div className="text-center mb-6">
        <h2 className="text-4xl font-display tracking-wider text-foreground leading-tight">
          Stay in<br />Control
        </h2>
        <p className="text-muted-foreground text-sm mt-3">
          This moment will pass. You are stronger<br />than the urge.
        </p>
      </div>

      {/* Breathe Card */}
      <button
        onClick={startBreathing}
        className="bg-secondary rounded-2xl p-6 flex flex-col items-center mb-4 active:scale-[0.98] transition-transform"
      >
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center mb-3 transition-transform duration-[4000ms] ${
          breathing ? (breathPhase === 'inhale' ? 'scale-125' : 'scale-100') : ''
        }`}>
          <Wind size={32} className="text-primary" />
        </div>
        {breathing ? (
          <>
            <p className="text-foreground text-xl font-semibold mb-1">
              {breathPhase === 'inhale' ? 'Breathe In...' : 'Breathe Out...'}
            </p>
            <p className="text-primary text-[10px] tracking-[0.3em] uppercase">
              {breathSeconds}s remaining
            </p>
          </>
        ) : (
          <>
            <p className="text-foreground text-xl font-semibold mb-1">Breathe</p>
            <p className="text-primary text-[10px] tracking-[0.3em] uppercase">Center your focus</p>
          </>
        )}
      </button>

      {/* Reset Focus */}
      <button
        onClick={handleResetFocus}
        className="bg-secondary rounded-2xl px-5 py-4 flex items-center gap-4 mb-3 active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <RotateCcw size={20} className="text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-foreground font-semibold">Reset Focus</p>
          <p className="text-muted-foreground text-xs">Step away. Change your environment immediately.</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </button>

      {resetMessage && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-3 animate-fade-in">
          <p className="text-primary text-sm text-center">Move to a different space. Break the pattern.</p>
        </div>
      )}

      {/* Try Again */}
      <button
        onClick={onRideUrge}
        className="bg-secondary rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Timer size={20} className="text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-foreground font-semibold">Try Again</p>
          <p className="text-muted-foreground text-xs">Return to the urge timer. Ride the wave.</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </button>

      <div className="flex-1" />

      {/* Back to Dashboard */}
      <button
        onClick={onDashboard}
        className="w-full py-4 rounded-xl border border-border text-foreground font-display text-sm tracking-wider active:scale-[0.98] transition-transform"
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
};

export default EmergencyHelp;
