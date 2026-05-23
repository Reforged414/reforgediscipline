import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Wind, RotateCcw, Timer, ChevronRight } from 'lucide-react';

interface EmergencyHelpProps {
  onBack: () => void;
  onRideUrge: () => void;
  onDashboard: () => void;
  onMirrorShield?: () => void;
}

const BREATH_DURATION = 4000; // 4 seconds per phase
const TOTAL_DURATION = 60; // 60 seconds total

const EmergencyHelp = ({ onBack, onRideUrge, onDashboard, onMirrorShield }: EmergencyHelpProps) => {
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(TOTAL_DURATION);
  const [resetMessage, setResetMessage] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (phaseTimeoutRef.current) { clearTimeout(phaseTimeoutRef.current); phaseTimeoutRef.current = null; }
  }, []);

  // Phase cycling using recursive timeouts for reliability
  useEffect(() => {
    if (!breathing) return;

    const cyclePhase = () => {
      setBreathPhase(p => (p === 'inhale' ? 'exhale' : 'inhale'));
      phaseTimeoutRef.current = setTimeout(cyclePhase, BREATH_DURATION);
    };
    phaseTimeoutRef.current = setTimeout(cyclePhase, BREATH_DURATION);

    return () => {
      if (phaseTimeoutRef.current) { clearTimeout(phaseTimeoutRef.current); phaseTimeoutRef.current = null; }
    };
  }, [breathing]);

  // Countdown timer
  useEffect(() => {
    if (!breathing) return;

    intervalRef.current = setInterval(() => {
      setBreathSeconds(s => {
        if (s <= 1) {
          setBreathing(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [breathing]);

  const startBreathing = () => {
    clearTimers();
    setBreathing(true);
    setBreathSeconds(TOTAL_DURATION);
    setBreathPhase('inhale');
  };

  const handleResetFocus = () => {
    setResetMessage(true);
    setTimeout(() => setResetMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-10 max-w-md mx-auto flex flex-col animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="text-foreground mb-6 active:scale-[0.97] transition-transform w-fit">
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
        className="bg-secondary rounded-2xl p-6 flex flex-col items-center mb-4 active:scale-[0.97] transition-transform"
      >
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center mb-3"
          style={{
            transform: breathing ? (breathPhase === 'inhale' ? 'scale(1.35)' : 'scale(0.85)') : 'scale(1)',
            transition: `transform ${BREATH_DURATION}ms ease-in-out`,
            boxShadow: breathing ? '0 0 30px hsl(25 95% 53% / 0.4)' : 'none',
          }}
        >
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
            <p className="text-foreground text-xl font-semibold mb-1">
              {breathSeconds === 0 ? 'Done! Tap to restart' : 'Breathe'}
            </p>
            <p className="text-primary text-[10px] tracking-[0.3em] uppercase">Center your focus</p>
          </>
        )}
      </button>

      {/* Reset Focus */}
      <button
        onClick={handleResetFocus}
        className="bg-secondary rounded-2xl px-5 py-4 flex items-center gap-4 mb-3 active:scale-[0.97] transition-transform"
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
        className="bg-secondary rounded-2xl px-5 py-4 flex items-center gap-4 mb-6 active:scale-[0.97] transition-transform"
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
        className="w-full py-4 rounded-xl border border-border text-foreground font-display text-sm tracking-wider active:scale-[0.97] transition-transform"
      >
        ← BACK TO DASHBOARD
      </button>
    </div>
  );
};

export default EmergencyHelp;
