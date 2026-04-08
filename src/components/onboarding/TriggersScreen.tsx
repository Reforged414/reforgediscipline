import { useState } from 'react';
import OnboardingHeader from './OnboardingHeader';
import ContinueButton from './ContinueButton';
import { Moon, Clock, Zap, Smartphone, Users, Flame, Plus } from 'lucide-react';

const TRIGGERS = [
  { id: 'late-night', label: 'Late Night\nPhone Use', icon: Moon },
  { id: 'boredom', label: 'Boredom', icon: Clock },
  { id: 'stress', label: 'Stress', icon: Zap },
  { id: 'social-media', label: 'Social Media', icon: Smartphone },
  { id: 'loneliness', label: 'Loneliness', icon: Users },
  { id: 'urge', label: 'Urge/Craving', icon: Flame },
  { id: 'other', label: 'Other', icon: Plus },
];

interface Props {
  step: number;
  total: number;
  selected: string[];
  onBack: () => void;
  onNext: (triggers: string[]) => void;
}

const TriggersScreen = ({ step, total, selected: init, onBack, onNext }: Props) => {
  const [selected, setSelected] = useState<string[]>(init);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingHeader step={step} total={total} onBack={onBack} />

      <div className="flex-1 px-5">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            What Sets You<br />Back?
          </h1>
          <p className="text-muted-foreground text-sm">
            Select the triggers that lead to<br />relapse.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TRIGGERS.map((t, idx) => {
            const isSelected = selected.includes(t.id);
            const Icon = t.icon;
            const isLast = idx === TRIGGERS.length - 1;
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`flex flex-col items-center gap-3 px-4 py-5 rounded-xl border transition-all ${
                  isLast ? 'col-span-2 max-w-[50%] mx-auto w-full' : ''
                } ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary'
                }`}
              >
                <Icon size={24} className="text-primary" />
                <span className="text-foreground text-xs text-center whitespace-pre-line">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ContinueButton disabled={selected.length === 0} onClick={() => onNext(selected)} />
    </div>
  );
};

export default TriggersScreen;
