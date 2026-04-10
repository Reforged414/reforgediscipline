import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Footprints, RotateCcw, X } from 'lucide-react';

interface RideTheUrgeProps {
  onResisted: () => void;
  onBack: () => void;
  onStillStruggling?: () => void;
}

const TOTAL_SECONDS = 90;

const ACTION_GUIDANCE: Record<string, { title: string; text: string }> = {
  OBSERVE: {
    title: 'Observe',
    text: 'Notice the urge without reacting. Where do you feel it in your body? Let it pass like a wave.',
  },
  'TAKE A WALK': {
    title: 'Take a Walk',
    text: 'Stand up and walk for a few minutes. Change your environment. Movement breaks the pattern.',
  },
};

const RideTheUrge = ({ onResisted, onBack, onStillStruggling }: RideTheUrgeProps) => {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(true);
  const [guidanceModal, setGuidanceModal] = useState<{ title: string; text: string } | null>(null);
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

  const handleAction = (label: string) => {
    if (label === 'RESET') {
      handleReset();
    } else if (ACTION_GUIDANCE[label]) {
      setGuidanceModal(ACTION_GUIDANCE[label]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-12 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="text-foreground active:scale-[0.97] transition-transform">
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

      {/* Timer ring with breathing animation */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-64 h-264">
          {/* Breathing glow circle behind timer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: 'radial-gradient(circle, hsl(25 95% 53% / 0.2) 0%, transparent 70%)',
            }}
          />
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
              <span className="text-xs text-primary tracking-widest uppercase mt-1">
                {running ? 'Breathe' : 'Remaining'}
              </span>
            </div>
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
          { icon: RotateCcw, label: 'RESET' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => handleAction(label)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-border active:scale-[0.95] transition-transform"
          >
            <Icon size={16} className="text-foreground" />
            <span className="text-[9px] text-muted-foreground tracking-wider">{label}</span>
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <button
        onClick={onResisted}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider mb-3 active:scale-[0.97] transition-transform"
      >
        I RESISTED
      </button>
      <button
        onClick={onStillStruggling || onBack}
        className="w-full py-4 rounded-xl border border-border text-foreground font-display text-lg tracking-wider active:scale-[0.97] transition-transform"
      >
        STILL STRUGGLING
      </button>

      <p className="text-center text-muted-foreground text-xs mt-4 tracking-wider uppercase">
        You are stronger than the urge.
      </p>

      {/* Guidance Modal */}
      {guidanceModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in" onClick={() => setGuidanceModal(null)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[85%] max-w-sm bg-card border border-border rounded-2xl p-6 animate-fade-in">
            <button onClick={() => setGuidanceModal(null)} className="absolute top-3 right-3 text-muted-foreground active:scale-[0.95] transition-transform">
              <X size={18} />
            </button>
            <h3 className="text-foreground text-lg font-semibold mb-2">{guidanceModal.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{guidanceModal.text}</p>
            <button
              onClick={() => setGuidanceModal(null)}
              className="mt-5 w-full py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider active:scale-[0.97] transition-transform"
            >
              GOT IT
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RideTheUrge;
