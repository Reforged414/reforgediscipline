import { useState } from 'react';
import OnboardingHeader from './OnboardingHeader';
import ContinueButton from './ContinueButton';
import { Clock, CalendarDays, Calendar, CalendarPlus, HelpCircle } from 'lucide-react';

const OPTIONS = [
  { id: 'today', label: 'Today', icon: Clock },
  { id: 'yesterday', label: 'Yesterday', icon: CalendarDays },
  { id: '3-4-days', label: '3-4 days ago', icon: Calendar },
  { id: 'week+', label: 'A week+', icon: CalendarPlus },
  { id: 'not-sure', label: 'Not sure', icon: HelpCircle },
];

interface Props {
  step: number;
  total: number;
  selected: string;
  onBack: () => void;
  onNext: (value: string) => void;
  editMode?: boolean;
}

const LastRelapseScreen = ({ step, total, selected: init, onBack, onNext, editMode }: Props) => {
  const [selected, setSelected] = useState(init);

  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingHeader step={step} total={total} onBack={onBack} editMode={editMode} />

      <div className="flex-1 px-5">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            When was your last relapse?
          </h1>
          <p className="text-muted-foreground text-sm">Be honest with yourself.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.id;
            const Icon = opt.icon;
            const isLast = idx === OPTIONS.length - 1;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`flex flex-col items-center gap-3 px-4 py-5 rounded-xl border transition-all ${
                  isLast ? 'col-span-2 max-w-[50%] mx-auto w-full' : ''
                } ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary'
                }`}
              >
                <Icon size={24} className="text-primary" />
                <span className="text-foreground text-sm">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ContinueButton disabled={!selected} onClick={() => onNext(selected)} />
    </div>
  );
};

export default LastRelapseScreen;
