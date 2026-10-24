import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import GuidedTourOverlay, { type TourStep } from '@/components/GuidedTourOverlay';

const PREMIUM_STEPS: TourStep[] = [
  {
    selector: '[data-tutorial="insights-tab"]',
    title: 'AI Insights',
    body: 'Trigger analysis and weekly recovery insights are now unlocked here.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="community-tab"]',
    title: 'Community',
    body: 'Comment on posts and use the full set of reactions.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="shield-tab"]',
    title: 'Shield',
    body: 'Block distracting apps and websites to protect your streak.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="discipline-goals"]',
    title: 'Unlimited Goals',
    body: 'Add as many personal goals as you want. The 3-goal limit is gone.',
    placement: 'bottom',
    tab: 'dashboard',
  },
];

const gotoTab = (tab: string) =>
  window.dispatchEvent(new CustomEvent('reforged-tour-goto-tab', { detail: tab }));

const PremiumTutorialOverlay = () => {
  const {
    hasSeenPremiumTutorial,
    premiumTutorialPending,
    markPremiumTutorialSeen,
    dismissPremiumTutorialPrompt,
  } = useAppStore();
  const [touring, setTouring] = useState(false);

  const asking = premiumTutorialPending && !hasSeenPremiumTutorial && !touring;

  const handleYes = () => {
    dismissPremiumTutorialPrompt();
    // Start from Home so every step has something to point at.
    gotoTab('dashboard');
    // Small delay so the paywall closes and the tab settles before we measure.
    setTimeout(() => setTouring(true), 500);
  };

  const handleSkip = () => {
    dismissPremiumTutorialPrompt();
    markPremiumTutorialSeen();
  };

  const handleDone = () => {
    markPremiumTutorialSeen();
    setTouring(false);
  };

  if (touring) return <GuidedTourOverlay steps={PREMIUM_STEPS} onDone={handleDone} onEnterStep={(s) => s.tab && gotoTab(s.tab)} />;

  if (!asking) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-2xl bg-card border border-primary/30 p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-3 w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles size={20} className="text-primary" />
        </div>
        <p className="font-display text-lg tracking-wider text-foreground uppercase">Premium unlocked</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Want a quick tour of your new features?
        </p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 rounded-xl border border-border text-xs tracking-wider uppercase text-muted-foreground"
          >
            Not now
          </button>
          <button
            onClick={handleYes}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-display tracking-wider uppercase"
          >
            Show me
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumTutorialOverlay;
