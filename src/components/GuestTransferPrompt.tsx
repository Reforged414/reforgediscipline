import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';

/**
 * Shown once when a guest signs into an account and has meaningful local progress.
 * Offers to transfer guest progress to the new cloud account, or discard it.
 */
const GuestTransferPrompt = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const state = useAppStore();

  useEffect(() => {
    if (!user) return;
    const pending = localStorage.getItem('reforged-pending-transfer');
    if (pending === 'true') setOpen(true);
  }, [user]);

  if (!user || !open) return null;

  const summary: string[] = [];
  if (state.streak > 0) summary.push(`${state.streak}-day streak`);
  if (state.xp > 0) summary.push(`${state.xp} XP`);
  if (state.urgeLogs.length) summary.push(`${state.urgeLogs.length} urge log${state.urgeLogs.length > 1 ? 's' : ''}`);
  if (state.journalLogs.length) summary.push(`${state.journalLogs.length} journal entr${state.journalLogs.length > 1 ? 'ies' : 'y'}`);

  const finish = () => {
    localStorage.removeItem('reforged-pending-transfer');
    setOpen(false);
  };

  const handleTransfer = async () => {
    setBusy(true);
    try {
      await supabase
        .from('user_data')
        .update({
          streak: state.streak,
          xp: state.xp,
          level: state.level,
          level_name: state.levelName,
          xp_for_next_level: state.xpForNextLevel,
          onboarding_complete: state.onboardingComplete,
          onboarding_data: state.onboardingData as any,
          daily_discipline: state.dailyDiscipline as any,
          resisted_timestamps: state.resistedTimestamps as any,
          urge_logs: state.urgeLogs as any,
          relapse_logs: state.relapseLogs as any,
          journal_logs: state.journalLogs as any,
          shown_milestones: state.shownMilestones as any,
          pending_milestone: state.pendingMilestone,
          has_completed_tutorial: state.hasCompletedTutorial,
        } as any)
        .eq('user_id', user.id);
    } catch (e) {
      console.error('Transfer failed', e);
    } finally {
      setBusy(false);
      finish();
    }
  };

  const handleDiscard = () => {
    useAppStore.getState().resetAllLocalData();
    finish();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <button
            onClick={finish}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-4">
            <Upload size={20} className="text-primary" />
          </div>

          <h2 className="font-display text-xl tracking-wider text-foreground mb-2">
            TRANSFER YOUR PROGRESS?
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            We found progress from your guest session. Move it into your new account?
          </p>

          {summary.length > 0 && (
            <ul className="text-xs text-foreground/80 mb-5 space-y-1">
              {summary.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}

          <motion.button
            onClick={handleTransfer}
            disabled={busy}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display tracking-wider text-sm mb-2 disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {busy ? 'TRANSFERRING...' : 'TRANSFER PROGRESS'}
          </motion.button>
          <motion.button
            onClick={handleDiscard}
            disabled={busy}
            className="w-full py-3 rounded-xl border border-border text-muted-foreground text-xs tracking-wider"
            whileTap={{ scale: 0.97 }}
          >
            START FRESH
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuestTransferPrompt;
