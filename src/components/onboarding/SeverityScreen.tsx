import { useState } from 'react';
import { motion } from 'framer-motion';
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
        <motion.div
          className="text-center mb-10 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            How Often Does This<br />Happen?
          </h1>
        </motion.div>

        <div className="space-y-4">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt;
            return (
              <motion.button
                key={opt}
                onClick={() => setSelected(opt)}
                whileTap={{ scale: 0.97 }}
                animate={isSelected ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border ${
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
              </motion.button>
            );
          })}
        </div>
      </div>

      <ContinueButton disabled={!selected} onClick={() => onNext(selected)} />
    </div>
  );
};

export default SeverityScreen;
