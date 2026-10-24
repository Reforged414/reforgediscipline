import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import GuidedTourOverlay, { type TourStep } from '@/components/GuidedTourOverlay';

const STEPS: TourStep[] = [
  {
    selector: '[data-tutorial="daily-checkin"]',
    title: 'Daily Check-in',
    body: 'Start here every day to keep your streak alive.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="log-urge"]',
    title: 'Log Urge',
    body: 'Tap this when you feel an urge so you can track patterns.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="insights-tab"]',
    title: 'Insights',
    body: 'Your progress and patterns show up here after a few days.',
    placement: 'top',
  },
  {
    selector: '[data-tutorial="profile-tab"]',
    title: 'Profile',
    body: 'Track your XP, level, and account here.',
    placement: 'top',
  },
];

const TutorialOverlay = () => {
  const { hasSeenTutorial, hasCompletedTutorial, onboardingComplete, markTutorialSeen } = useAppStore();
  const [active, setActive] = useState(false);

  // Activate after onboarding, slight delay so layout is ready
  useEffect(() => {
    if (!onboardingComplete || hasSeenTutorial || hasCompletedTutorial) return;
    const t = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(t);
  }, [onboardingComplete, hasSeenTutorial, hasCompletedTutorial]);

  if (!active || hasSeenTutorial || hasCompletedTutorial || !onboardingComplete) return null;

  return (
    <GuidedTourOverlay
      steps={STEPS}
      onDone={() => {
        markTutorialSeen();
        setActive(false);
      }}
    />
  );
};

export default TutorialOverlay;
