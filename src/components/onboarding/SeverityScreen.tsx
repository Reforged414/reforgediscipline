import { useState } from 'react';
import { motion } from 'framer-motion';
import OnboardingHeader from './OnboardingHeader';
import ContinueButton from './ContinueButton';
import { Calendar, Repeat, Clock, AlertTriangle } from 'lucide-react';

const OPTIONS = [
  { id: 'Occasional', label: 'Occasional', icon: Calendar },
  { id: 'Frequent', label: 'Frequent', icon: Repeat },
  { id: 'Habitual', label: 'Habitual', icon: Clock },
  { id: 'Severe', label: 'Severe', icon: AlertTriangle },
];

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
          <p className="text-muted-foreground text-sm">Be honest — this shapes your plan.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                whileTap={{ scale: 0.96 }}
                animate={isSelected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex flex-col items-center gap-3 px-4 py-5 rounded-xl border ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary'
                }`}
              >
                <Icon size={24} className="text-primary" />
                <span className="text-foreground text-sm">{opt.label}</span>
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
