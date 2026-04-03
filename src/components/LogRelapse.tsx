import { useState } from 'react';
import { ArrowLeft, Target, Brain, MapPin, PenLine } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface LogRelapseProps {
  onBack: () => void;
  onLogged: () => void;
}

const TRIGGERS = ['Stress', 'Boredom', 'Loneliness', 'Social Media', 'Late Night Phone Use', 'Urge / Craving', 'Other'] as const;
const MOODS = ['Calm', 'Anxious', 'Sad', 'Frustrated', 'Tired'] as const;
const LOCATIONS = ['Home', 'Bed', 'Bathroom', 'School', 'Work', 'Other'] as const;

const LogRelapse = ({ onBack, onLogged }: LogRelapseProps) => {
  const logRelapse = useAppStore((s) => s.logRelapse);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');

  const toggleTrigger = (t: string) =>
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleLog = () => {
    logRelapse({ triggers, mood: mood || '', location: location || '', reflection });
    onLogged();
  };

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-10 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack}>
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase">
          Logged at {time}
        </p>
      </div>

      <div className="text-center mb-2">
        <h1 className="text-4xl font-display tracking-wider text-foreground">
          <span className="italic text-primary">Log</span> Relapse
        </h1>
      </div>
      <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase text-center mb-8">
        Be honest. This helps you improve.
      </p>

      {/* 1. Triggers */}
      <div className="mb-6">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <Target size={14} className="text-primary" /> 1. Trigger - (Multi Select)
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

      {/* 2. Mood */}
      <div className="mb-6">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <Brain size={14} className="text-primary" /> 2. Mood
        </p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                mood === m
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-foreground'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Location */}
      <div className="mb-6">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-primary" /> 3. Location
        </p>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((l) => (
            <button
              key={l}
              onClick={() => setLocation(l)}
              className={`px-4 py-2 rounded-xl border text-xs transition-all ${
                location === l
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-foreground'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Reflection */}
      <div className="mb-8">
        <p className="text-foreground text-sm font-semibold mb-3 flex items-center gap-2">
          <PenLine size={14} className="text-primary" /> 4. Reflection - (Optional)
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What led up to this and how can you prevent it next time?"
          className="w-full h-28 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
        />
      </div>

      <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase text-center mb-4">
        Slip-ups happen. Progress isn't lost.
      </p>

      {/* Submit */}
      <button
        onClick={handleLog}
        disabled={triggers.length === 0 || !mood || !location}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wider disabled:opacity-40 transition-opacity"
      >
        LOG RELAPSE
      </button>
      <p className="text-primary text-xs text-center mt-2 font-semibold">+2 XP FOR HONESTY</p>
    </div>
  );
};

export default LogRelapse;
