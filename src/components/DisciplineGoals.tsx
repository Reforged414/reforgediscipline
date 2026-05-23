import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Lock, Sparkles } from 'lucide-react';
import { useDisciplineGoals } from '@/hooks/useDisciplineGoals';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';

const FREE_LIMIT = 3;

const DisciplineGoals = () => {
  const { goals, addGoal, toggleGoal, deleteGoal } = useDisciplineGoals();
  const { isPremium } = usePremium();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);

  const atLimit = !isPremium && goals.length >= FREE_LIMIT;

  const handleAddClick = () => {
    if (atLimit) {
      setPaywallOpen(true);
      return;
    }
    setAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) {
      setAdding(false);
      return;
    }
    if (!isPremium && goals.length >= FREE_LIMIT) {
      setPaywallOpen(true);
      setAdding(false);
      setDraft('');
      return;
    }
    await addGoal(draft);
    setDraft('');
    setAdding(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase">
          Personalized Goals
        </p>
        {isPremium ? (
          <span className="flex items-center gap-1 text-[9px] tracking-widest uppercase text-primary">
            <Sparkles size={10} /> Premium
          </span>
        ) : (
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">
            {goals.length}/{FREE_LIMIT}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="group flex items-center gap-3 bg-secondary rounded-xl px-4 py-3"
            >
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  goal.is_completed ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                }`}
                aria-label={goal.is_completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {goal.is_completed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="hsl(var(--primary-foreground))"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  goal.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {goal.goal_name}
              </span>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-muted-foreground/50 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete goal"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {adding && (
            <motion.form
              key="add-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3 border border-primary/40"
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={handleSubmit as unknown as () => void}
                placeholder="e.g. 30 min workout"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                maxLength={60}
              />
            </motion.form>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleAddClick}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 border border-dashed transition-colors ${
            atLimit
              ? 'border-primary/40 text-primary bg-primary/5'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
          }`}
        >
          {atLimit ? <Lock size={14} /> : <Plus size={14} />}
          <span className="text-xs tracking-wider uppercase">
            {atLimit ? 'Unlock unlimited goals' : 'Add discipline goal'}
          </span>
        </motion.button>
      </div>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason="You've reached the 3-goal limit on the free plan. Go Premium for unlimited discipline goals."
      />
    </>
  );
};

export default DisciplineGoals;
