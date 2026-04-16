import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import BottomNav from '@/components/BottomNav';
import ActionHub from '@/components/ActionHub';
import RideTheUrge from '@/components/RideTheUrge';
import RewardScreen from '@/components/RewardScreen';
import LogUrge from '@/components/LogUrge';
import LogRelapse from '@/components/LogRelapse';
import RecoveryScreen from '@/components/RecoveryScreen';
import ProfilePlaceholder from '@/components/ProfilePlaceholder';
import ComingSoonPlaceholder from '@/components/ComingSoonPlaceholder';
import InsightsScreen from '@/components/InsightsScreen';
import DailyCheckIn from '@/components/DailyCheckIn';
import EmergencyHelp from '@/components/EmergencyHelp';
import JournalEntry from '@/components/JournalEntry';
import MilestoneScreen from '@/components/MilestoneScreen';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import LoginScreen from '@/components/LoginScreen';
import TutorialOverlay from '@/components/TutorialOverlay';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/hooks/useCloudSync';

type Screen = 'dashboard' | 'profile' | 'ride' | 'reward' | 'log' | 'relapse' | 'recovery' | 'checkin' | 'emergency' | 'journal' | 'milestone';

type Variant = { initial: Record<string, any>; animate: Record<string, any>; exit: Record<string, any> };

const slideRight: Variant = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-30%', opacity: 0 },
};

const slideLeft: Variant = {
  initial: { x: '-100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '30%', opacity: 0 },
};

const fade: Variant = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

const transition = { type: 'tween' as const, duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

const PageWrap = ({ children, variant, screenKey }: { children: React.ReactNode; variant: Variant; screenKey: string }) => (
  <motion.div
    key={screenKey}
    initial={variant.initial}
    animate={variant.animate}
    exit={variant.exit}
    transition={transition}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

const Index = () => {
  const { session, user, isGuest, loading } = useAuth();
  useCloudSync();

  const [screen, setScreen] = useState<Screen>('dashboard');
  const [actionHubOpen, setActionHubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const prevScreen = useRef<Screen>('dashboard');
  const { streak, resistUrge, onboardingComplete, completeOnboarding, pendingMilestone, dismissMilestone } = useAppStore();

  // Auto-navigate to milestone screen when a pending milestone exists
  useEffect(() => {
    if (pendingMilestone && screen === 'dashboard') {
      navigateTo('milestone');
    }
  }, [pendingMilestone]);

  // Show onboarding FIRST for new users (before any auth check)
  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={(data) => completeOnboarding(data.lastRelapse)} />;
  }

  // Show loading while checking auth (only after onboarding is done)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Show login if not authenticated and not guest (only after onboarding)
  if (!session && !isGuest) {
    return <LoginScreen />;
  }

  const navigateTo = (next: Screen) => {
    prevScreen.current = screen;
    setScreen(next);
  };

  const goBack = (target: Screen = 'dashboard') => {
    prevScreen.current = screen;
    setScreen(target);
    if (target === 'dashboard') setActiveTab('dashboard');
  };

  const handleResisted = () => {
    resistUrge();
    navigateTo('reward');
  };

  const handleContinue = () => goBack('dashboard');

  // Determine direction: going "forward" into a sub-screen or "back" to dashboard
  const isGoingBack = screen === 'dashboard';
  const getVariant = () => {
    if (screen === 'reward' || screen === 'recovery') return fade;
    return isGoingBack ? slideLeft : slideRight;
  };

  const renderScreen = () => {
    switch (screen) {
      case 'journal':
        return (
          <PageWrap variant={slideRight} screenKey="journal">
            <JournalEntry onBack={handleContinue} />
          </PageWrap>
        );
      case 'checkin':
        return (
          <PageWrap variant={slideRight} screenKey="checkin">
            <DailyCheckIn onBack={handleContinue} onComplete={handleContinue} />
          </PageWrap>
        );
      case 'emergency':
        return (
          <PageWrap variant={slideRight} screenKey="emergency">
            <EmergencyHelp
              onBack={() => navigateTo('ride')}
              onRideUrge={() => navigateTo('ride')}
              onDashboard={handleContinue}
            />
          </PageWrap>
        );
      case 'relapse':
        return (
          <PageWrap variant={slideRight} screenKey="relapse">
            <LogRelapse
              onBack={() => goBack('dashboard')}
              onLogged={() => navigateTo('recovery')}
            />
          </PageWrap>
        );
      case 'recovery':
        return (
          <PageWrap variant={fade} screenKey="recovery">
            <RecoveryScreen onContinue={handleContinue} />
          </PageWrap>
        );
      case 'log':
        return (
          <PageWrap variant={slideRight} screenKey="log">
            <LogUrge
              onBack={() => goBack('dashboard')}
              onRideUrge={() => navigateTo('ride')}
            />
          </PageWrap>
        );
      case 'ride':
        return (
          <PageWrap variant={slideRight} screenKey="ride">
            <RideTheUrge
              onResisted={handleResisted}
              onBack={() => goBack('dashboard')}
              onStillStruggling={() => navigateTo('emergency')}
            />
          </PageWrap>
        );
      case 'milestone':
        return (
          <PageWrap variant={fade} screenKey="milestone">
            <MilestoneScreen
              milestone={pendingMilestone ?? streak}
              onContinue={() => { dismissMilestone(); goBack('dashboard'); }}
            />
          </PageWrap>
        );
      case 'reward':
        return (
          <PageWrap variant={fade} screenKey="reward">
            <RewardScreen streak={streak} onContinue={handleContinue} />
          </PageWrap>
        );
      default:
        return (
          <PageWrap variant={slideLeft} screenKey={`main-${activeTab}`}>
            <div className="max-w-md mx-auto relative min-h-screen">
              {activeTab === 'dashboard' && (
                <Dashboard
                  onRideUrge={() => { setActionHubOpen(false); navigateTo('ride'); }}
                  onLogUrge={() => { setActionHubOpen(false); navigateTo('log'); }}
                  onDailyCheckIn={() => navigateTo('checkin')}
                  onJournal={() => navigateTo('journal')}
                />
              )}
              {activeTab === 'insights' && <InsightsScreen />}
              {activeTab === 'community' && <ComingSoonPlaceholder title="Community" />}
              {activeTab === 'profile' && <ProfilePlaceholder />}
            </div>
          </PageWrap>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto relative" style={{ minHeight: '100dvh' }}>
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>

      {screen === 'dashboard' && (
        <>
          <ActionHub
            open={actionHubOpen}
            onClose={() => setActionHubOpen(false)}
            onRideUrge={() => { setActionHubOpen(false); navigateTo('ride'); }}
            onLogUrge={() => { setActionHubOpen(false); navigateTo('log'); }}
            onLogRelapse={() => { setActionHubOpen(false); navigateTo('relapse'); }}
            onEmergencyHelp={() => { setActionHubOpen(false); navigateTo('emergency'); }}
            onJournal={() => { setActionHubOpen(false); navigateTo('journal'); }}
          />
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); setScreen('dashboard'); }}
            onPlusPress={() => setActionHubOpen(true)}
          />
        </>
      )}

      {screen === 'dashboard' && activeTab === 'dashboard' && <TutorialOverlay />}
    </div>
  );
};

export default Index;
