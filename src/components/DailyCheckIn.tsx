import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Target, Smile, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface DailyCheckInProps {
  onBack: () => void;
  onComplete: () => void;
}

const moods = [
  { label: 'Empowered', icon: Zap },
  { label: 'Focused', icon: Target },
  { label: 'Neutral', icon: Smile },
  { label: 'Struggling', icon: AlertTriangle },
];

const urgeOptions = ['None', 'Mild', 'Strong'];

const DailyCheckIn = ({ onBack, onComplete }: DailyCheckInProps) => {
  const [mood, setMood] = useState('');
  const [urgeLevel, setUrgeLevel] = useState('');
  const [reflection, setReflection] = useState('');
  const { completeDailyCheckIn, dailyDiscipline } = useAppStore();

  const canSubmit = mood && urgeLevel && !dailyDiscipline.checkedIn;

  const handleSubmit = () => {
    if (!canSubmit) return;
    completeDailyCheckIn();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-10 max-w-md mx-auto">
      {/* Header */}
      <button onClick={onBack} className="text-foreground mb-6">
        <ArrowLeft size={24} />
      </button>

      <h2 className="text-3xl font-display tracking-wider text-center mb-1">
        <span className="text-primary italic">Daily</span> Check-In
      </h2>

      {/* Mood */}
      <div className="mt-8">
        <h3 className="text-foreground font-semibold text-center mb-4">How Are You Feeling Today?</h3>
        <div className="grid grid-cols-2 gap-3">
          {moods.map(({ label, icon: Icon }) => {
            const isSel = mood === label;
            return (
              <motion.button
                key={label}
                onClick={() => setMood(label)}
                whileTap={{ scale: 0.96 }}
                animate={isSel ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex flex-col items-center gap-2 py-5 rounded-xl border-2 ${
                  isSel
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary'
                }`}
              >
                <Icon size={28} className={isSel ? 'text-primary' : 'text-primary/60'} />
                <span className={`text-sm ${isSel ? 'text-primary font-medium' : 'text-foreground'}`}>
                  {label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Urges */}
      <div className="mt-8">
        <h3 className="text-foreground font-semibold text-center mb-4">Did you experience urges today?</h3>
        <div className="flex gap-2">
          {urgeOptions.map((opt) => {
            const isSel = urgeLevel === opt;
            return (
              <motion.button
                key={opt}
                onClick={() => setUrgeLevel(opt)}
                whileTap={{ scale: 0.96 }}
                animate={isSel ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex-1 py-3 rounded-xl font-display tracking-wider text-sm ${
                  isSel
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground border border-border'
                }`}
              >
                {opt.toUpperCase()}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Reflection */}
      <div className="mt-8">
        <h3 className="text-foreground font-display tracking-wider text-xs uppercase mb-3">
          Reflection - (Optional)
        </h3>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="What did you learn today? What will you do differently tomorrow?"
          className="w-full h-28 bg-secondary border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full mt-8 py-4 rounded-xl font-display text-lg tracking-wider transition-all active:scale-[0.97] ${
          canSubmit
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        COMPLETE CHECK-IN
      </button>
    </div>
  );
};

export default DailyCheckIn;
