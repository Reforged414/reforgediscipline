import { useState } from 'react';
import { motion } from 'framer-motion';
import OnboardingHeader from './OnboardingHeader';
import ContinueButton from './ContinueButton';
import { Ban, Flame, Target, Shield, Heart, Brain, Sword, Zap } from 'lucide-react';

const GOALS = [
  { id: 'quit', label: 'Quit addiction', icon: Ban },
  { id: 'discipline', label: 'Build discipline', icon: Flame },
  { id: 'focus', label: 'Improve focus', icon: Target },
  { id: 'control', label: 'Gain control', icon: Shield },
];

const IDENTITIES = [
  { id: 'self-control', label: 'Stronger self-control', icon: Heart },
  { id: 'clearer-mind', label: 'Clearer mind', icon: Brain },
  { id: 'disciplined', label: 'More disciplined', icon: Sword },
  { id: 'confident', label: 'More confident', icon: Zap },
];

interface Props {
  step: number;
  total: number;
  goals: string[];
  identity: string[];
  onBack: () => void;
  onNext: (goals: string[], identity: string[]) => void;
  editMode?: boolean;
}

const GoalIdentityScreen = ({ step, total, goals: initGoals, identity: initIdentity, onBack, onNext, editMode }: Props) => {
  const [goals, setGoals] = useState<string[]>(initGoals);
  const [identity, setIdentity] = useState<string[]>(initIdentity);

  const toggleGoal = (id: string) =>
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const toggleIdentity = (id: string) =>
    setIdentity((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingHeader step={step} total={total} onBack={onBack} editMode={editMode} />

      <div className="flex-1 px-5 overflow-y-auto pb-4">
        <motion.div
          className="text-center mb-8 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Why are you here?</h1>
          <p className="text-muted-foreground text-sm">Choose your goal and direction.</p>
        </motion.div>

        {/* Goals */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Primary Goal - (Multi Select)
        </p>
        <div className="space-y-3 mb-8">
          {GOALS.map((g) => {
            const selected = goals.includes(g.id);
            const Icon = g.icon;
            return (
              <motion.button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                whileTap={{ scale: 0.96 }}
                animate={selected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? 'bg-primary/20' : 'bg-secondary'}`}>
                  <Icon size={18} className="text-primary" />
                </div>
                <span className="text-foreground text-sm flex-1 text-left">{g.label}</span>
                {selected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Identity */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Who Do You Want To Become?
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {IDENTITIES.map((i) => {
            const selected = identity.includes(i.id);
            const Icon = i.icon;
            return (
              <button
                key={i.id}
                onClick={() => toggleIdentity(i.id)}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border transition-all ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary'
                }`}
              >
                <Icon size={20} className="text-primary" />
                <span className="text-foreground text-xs text-center">{i.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ContinueButton
        disabled={goals.length === 0}
        onClick={() => onNext(goals, identity)}
      />
    </div>
  );
};

export default GoalIdentityScreen;
