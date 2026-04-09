import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Eye, Footprints, RotateCcw } from 'lucide-react';

interface RideTheUrgeProps {
  onResisted: () => void;
  onBack: () => void;
  onStillStruggling?: () => void;
}

const TOTAL_SECONDS = 90;

const RideTheUrge = ({ onResisted, onBack, onStillStruggling }: RideTheUrgeProps) => {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, seconds]);

  const progress = 1 - seconds / TOTAL_SECONDS;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handleReset = () => {
    setSeconds(TOTAL_SECONDS);
    setRunning(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center font-display text-lg tracking-widest text-primary">
          REFORGED
        </h1>
        <div className="w-6" />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-foreground">
          <span className="italic text-primary">Ride </span>The Urge
        </h2>
        <p className="text-muted-foreground text-xs tracking-widest mt-2 uppercase">
          Urges are temporary. Stay present and let it pass.
        </p>
      </div>

      {/* Timer ring */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
            <circle
              cx="130" cy="130" r="120"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
            />
            <circle
              cx="130" cy="130" r="120"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 8px hsl(25 95% 53% / 0.5))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-light text-foreground tracking-wider">{timeStr}</span>
            <span className="text-xs text-primary tracking-widest uppercase mt-1">Remaining</span>
          </div>
        </div>
      </div>

      {/* XP hint */}
      <p className="text-center text-primary text-xs tracking-wider mb-4">
        +10 DISCIPLINE POINTS IF COMPLETED
      </p>

      {/* Motivational text */}
      <p className="text-center text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
        THIS FEELING WILL PEAK, THEN FADE.{'\n'}STAY WITH IT.
      </p>

      {/* Quick actions */}
      <div className="flex justify-center gap-4 mb-6">
        {[
          { icon: Eye, label: 'OBSERVE' },
          { icon: Footprints, label: 'TAKE A WALK' },
          { icon: RotateCcw, label: 'RESET', action: handleReset },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-border active:scale-95 transition-transform"
          >
            <Icon size={16} className="text-foreground" />
            <span className="text-[9px] text-muted-foreground tracking-wider">{label}</span>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <button
        onClick={onResisted}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider mb-3 active:scale-[0.98] transition-transform"
      >
        I RESISTED
      </button>
      <button
        onClick={onStillStruggling || onBack}
        className="w-full py-4 rounded-xl border border-border text-foreground font-display text-lg tracking-wider active:scale-[0.98] transition-transform"
      >
        STILL STRUGGLING
      </button>

      <p className="text-center text-muted-foreground text-xs mt-4 tracking-wider uppercase">
        You are stronger than the urge.
      </p>
    </div>
  );
};

export default RideTheUrge;
