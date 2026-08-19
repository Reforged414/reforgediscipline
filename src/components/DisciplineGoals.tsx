import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Lock, Sparkles } from 'lucide-react';
import { getGoalIcon } from '@/lib/goalIcons';
import { toast } from 'sonner';
import { useDisciplineGoals } from '@/hooks/useDisciplineGoals';
import { usePremium } from '@/hooks/usePremium';
import { useAppStore } from '@/store/useAppStore';
import PaywallModal from '@/components/PaywallModal';

const FREE_LIMIT = 3;
const GOAL_XP = 5;

const DisciplineGoals = () => {
  const { goals, addGoal, toggleGoal, deleteGoal } = useDisciplineGoals();
  const { isPremium } = usePremium();
  const awardXp = useAppStore((s) => s.awardXp);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);

  const handleToggle = async (id: string) => {
    const target = goals.find((g) => g.id === id);
    if (!target) return;
    const willComplete = !target.is_completed;
    await toggleGoal(id);
    if (willComplete) {
      awardXp(GOAL_XP);
      toast.success(`Goal complete · +${GOAL_XP} XP`, { duration: 2200 });
    } else {
      awardXp(-GOAL_XP);
    }
  };

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
              className="group flex items-center gap-3 bg-secondary/70 border border-border/60 rounded-xl px-4 py-3 shadow-[0_2px_12px_hsl(0_0%_0%_/_0.35)]"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  goal.is_completed ? 'bg-primary/25 text-primary' : 'bg-primary/10 text-primary/70'
                }`}
                style={goal.is_completed ? { boxShadow: '0 0 14px hsl(var(--primary) / 0.35)' } : undefined}
              >
                {(() => {
                  const Icon = getGoalIcon(goal.icon_name);
                  return <Icon size={18} />;
                })()}
              </div>
              <span
                className={`flex-1 text-sm ${
                  goal.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {goal.goal_name}
              </span>
              <span className="text-primary text-xs mr-1">+{GOAL_XP} XP</span>
              <button
                onClick={() => handleToggle(goal.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                  goal.is_completed ? 'bg-primary border-primary animate-glow-once' : 'border-muted-foreground/40'
                }`}
                aria-label={goal.is_completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {goal.is_completed && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="animate-check-pop">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="hsl(var(--primary-foreground))"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="p-1.5 -m-1 text-muted-foreground/60 hover:text-destructive active:text-destructive transition-colors"
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
              className="flex items-center gap-3 bg-secondary/70 rounded-xl px-4 py-3 border border-primary/40 shadow-[0_2px_12px_hsl(0_0%_0%_/_0.35)]"
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
