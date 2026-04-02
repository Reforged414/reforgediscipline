import { useState } from 'react';
import { ArrowLeft, Zap, Target, Circle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface LogUrgeProps {
  onBack: () => void;
  onRideUrge: () => void;
}

const STRENGTHS = ['Mild', 'Moderate', 'Strong', 'Overwhelming'] as const;
const TRIGGERS = ['Stress', 'Boredom', 'Loneliness', 'Social media', 'Late night phone use', 'Sexual imagery', 'Other'] as const;

const ACTIONS = [
  { label: 'Ignored', icon: '🚫' },
  { label: 'Walk', icon: '🚶' },
  { label: 'Cold shower', icon: '❄️' },
  { label: 'Workout', icon: '💪' },
  { label: 'Meditation', icon: '🧘' },
  { label: 'Other', icon: '✦' },
] as const;

const LogUrge = ({ onLog, onBack, onRideUrge }: LogUrgeProps) => {
  const [strength, setStrength] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const toggleTrigger = (t: string) =>
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleAction = (a: string) =>
    setActions((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handleLog = () => {
    onLog();

    if (strength === 'Strong' || strength === 'Overwhelming') {
      setShowSuggestion(true);
    } else {
      setFeedback(true);
      setTimeout(() => onBack(), 2000);
    }
  };

  if (feedback) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <p className="text-foreground text-xl font-display tracking-wider mb-2">Logged.</p>
        <p className="text-muted-foreground text-sm mb-1">You're building awareness.</p>
        <p className="text-primary text-sm font-semibold">+2 XP</p>
        <button onClick={onBack} className="mt-6 text-xs text-muted-foreground underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (showSuggestion) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <p className="text-foreground text-xl font-display tracking-wider mb-2">Logged. +2 XP</p>
        <p className="text-muted-foreground text-sm mb-6">You're building awareness.</p>
        <p className="text-foreground text-sm mb-4">Your urge was intense. Want to ride it out?</p>
        <button
          onClick={onRideUrge}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider mb-3"
        >
          RIDE THE URGE
        </button>
        <button onClick={onBack} className="text-xs text-muted-foreground underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-10 max-w-md mx-auto">
      {/* Header */}
      <button onClick={onBack} className="mb-4">
        <ArrowLeft size={20} className="text-foreground" />
      </button>
      <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mb-4">
        Logged at {time}
      </p>

      <div className="text-center mb-2">
        <h1 className="text-4xl font-display tracking-wider text-foreground">
          <span className="italic">Log</span> Urge
        </h1>
        <span className="text-primary text-sm font-semibold ml-2">+ 2XP</span>
      </div>
      <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase text-center mb-8">
        Recognizing urges is the first step to mastering them.
      </p>

      {/* Urge Strength */}
      <div className="mb-6">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap size={14} className="text-primary" /> Urge Strength
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STRENGTHS.map((s) => (
            <button
              key={s}
              onClick={() => setStrength(s)}
              className={`py-3 rounded-xl border text-sm transition-all ${
                strength === s
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div className="mb-6">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <Target size={14} className="text-primary" /> What triggered it? (Multi-Select)
        </p>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTrigger(t)}
              className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                triggers.includes(t)
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Actions taken */}
      <div className="mb-8">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <Circle size={14} className="text-primary" /> What did you do instead? (Optional)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => toggleAction(label)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all ${
                actions.includes(label)
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-foreground'
              }`}
            >
              <span className="text-primary">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase text-center mb-4">
        Recognizing patterns builds control.
      </p>

      {/* Submit */}
      <button
        onClick={handleLog}
        disabled={!strength}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider disabled:opacity-40 transition-opacity"
      >
        LOG URGE
      </button>
    </div>
  );
};

export default LogUrge;
