import { useState } from 'react';
import OnboardingHeader from './OnboardingHeader';
import ContinueButton from './ContinueButton';

const OPTIONS = ['Occasional', 'Frequent', 'Habitual', 'Severe'];

interface Props {
  step: number;
  total: number;
  selected: string;
  onBack: () => void;
  onNext: (value: string) => void;
  editMode?: boolean;
}

const SeverityScreen = ({ step, total, selected: init, onBack, onNext, editMode }: Props) => {
  const [selected, setSelected] = useState(init);

  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingHeader step={step} total={total} onBack={onBack} editMode={editMode} />

      <div className="flex-1 px-5">
        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            How Often Does This<br />Happen?
          </h1>
        </div>

        <div className="space-y-4">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelected(opt)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-secondary'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-primary' : 'border-muted-foreground/40'
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ContinueButton disabled={!selected} onClick={() => onNext(selected)} />
    </div>
  );
};

export default SeverityScreen;
