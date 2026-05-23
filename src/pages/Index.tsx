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
void ComingSoonPlaceholder;
import InsightsScreen from '@/components/InsightsScreen';
import DailyCheckIn from '@/components/DailyCheckIn';
import EmergencyHelp from '@/components/EmergencyHelp';
import JournalEntry from '@/components/JournalEntry';
import MilestoneScreen from '@/components/MilestoneScreen';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import LoginScreen from '@/components/LoginScreen';
import WelcomeGate from '@/components/WelcomeGate';
import TutorialOverlay from '@/components/TutorialOverlay';
import SettingsScreen from '@/components/SettingsScreen';
import GuestTransferPrompt from '@/components/GuestTransferPrompt';
import ReforgedShield from '@/components/ReforgedShield';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync } from '@/hooks/useCloudSync';

type Screen = 'dashboard' | 'profile' | 'ride' | 'reward' | 'log' | 'relapse' | 'recovery' | 'checkin' | 'emergency' | 'journal' | 'milestone' | 'settings';
type EntryScreen = 'welcome' | 'onboarding' | 'login' | 'dashboard';

interface RewardCtx {
  title: string;
  subtitle: string;
  xp: number;
  showStreak: boolean;
}
const DEFAULT_REWARD: RewardCtx = {
  title: 'YOU STAYED IN CONTROL',
  subtitle: 'Resistance is Mastery',
  xp: 15,
  showStreak: true,
};

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
  const { session, loading } = useAuth();
  const { loading: cloudLoading } = useCloudSync();
  const [currentScreen, setCurrentScreen] = useState<EntryScreen>(() => 'welcome');

  const [screen, setScreen] = useState<Screen>('dashboard');
  const [actionHubOpen, setActionHubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rewardCtx, setRewardCtx] = useState<RewardCtx>(DEFAULT_REWARD);
  const prevScreen = useRef<Screen>('dashboard');
  const { streak, resistUrge, completeOnboarding, pendingMilestone, dismissMilestone } = useAppStore();

  // Auto-navigate to milestone screen when a pending milestone exists
  useEffect(() => {
    if (pendingMilestone && screen === 'dashboard') {
      navigateTo('milestone');
    }
  }, [pendingMilestone]);

  // Keep the explicit entry state aligned only for app bootstrap/sign-out cases.
  useEffect(() => {
    if (loading) return;
    if (session && currentScreen === 'welcome') {
      setCurrentScreen('dashboard');
    }
    if (!session && currentScreen === 'dashboard') {
      setCurrentScreen('welcome');
    }
  }, [loading, session, currentScreen]);

  // 1. Auth bootstrap or cloud hydration in progress — show splash to avoid onboarding flash
  if (loading || (session && currentScreen === 'welcome') || (currentScreen === 'dashboard' && session && cloudLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
          transition={{
            opacity: { duration: 0.6, ease: 'easeOut' },
            scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(25 95% 53%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative drop-shadow-[0_0_20px_hsl(25_95%_53%/0.6)]"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="mt-8 font-display text-2xl tracking-[0.3em] uppercase text-foreground"
        >
          Reforged Discipline
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-6 w-8 h-[2px] bg-primary/60 rounded-full"
        />
      </div>
    );
  }

  // 2. Explicit entry state machine — only user actions move between these screens.
  if (currentScreen === 'welcome') {
    return (
      <WelcomeGate
        onGetStarted={() => {
          localStorage.removeItem('reforged-guest');
          localStorage.removeItem('reforged-pending-transfer');
          setCurrentScreen('onboarding');
        }}
        onSignIn={() => setCurrentScreen('login')}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignedIn={() => setCurrentScreen('dashboard')}
      />
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={(data) => {
          completeOnboarding(data.lastRelapse, data);
          setCurrentScreen('dashboard');
        }}
      />
    );
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
    setRewardCtx({
      title: 'YOU STAYED IN CONTROL',
      subtitle: 'Resistance is Mastery',
      xp: 15,
      showStreak: true,
    });
    navigateTo('reward');
  };

  const handleCheckInComplete = () => {
    setRewardCtx({
      title: 'CHECK-IN COMPLETE',
      subtitle: 'Consistency Compounds',
      xp: 10,
      showStreak: true,
    });
    navigateTo('reward');
  };

  const handleJournalSaved = () => {
    setRewardCtx({
      title: 'REFLECTION LOGGED',
      subtitle: 'Awareness Forges Discipline',
      xp: 15,
      showStreak: false,
    });
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
            <JournalEntry onBack={handleContinue} onSaved={handleJournalSaved} />
          </PageWrap>
        );
      case 'checkin':
        return (
          <PageWrap variant={slideRight} screenKey="checkin">
            <DailyCheckIn onBack={handleContinue} onComplete={handleCheckInComplete} />
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
            <RewardScreen
              streak={streak}
              onContinue={handleContinue}
              title={rewardCtx.title}
              subtitle={rewardCtx.subtitle}
              xp={rewardCtx.xp}
              showStreak={rewardCtx.showStreak}
            />
          </PageWrap>
        );
      case 'settings':
        return (
          <PageWrap variant={slideRight} screenKey="settings">
            <SettingsScreen onBack={() => goBack('dashboard')} />
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
                  onOpenSettings={() => navigateTo('settings')}
                />
              )}
              {activeTab === 'insights' && <InsightsScreen />}
              {activeTab === 'shield' && <ReforgedShield />}
              {activeTab === 'profile' && <ProfilePlaceholder onOpenSettings={() => navigateTo('settings')} />}
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

      <GuestTransferPrompt />

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
