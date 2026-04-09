import { useState } from 'react';
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
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useAppStore } from '@/store/useAppStore';

type Screen = 'dashboard' | 'profile' | 'ride' | 'reward' | 'log' | 'relapse' | 'recovery' | 'checkin' | 'emergency';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [actionHubOpen, setActionHubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { streak, resistUrge, onboardingComplete, completeOnboarding } = useAppStore();

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={(data) => completeOnboarding(data.lastRelapse)} />;
  }

  const handleResisted = () => {
    resistUrge();
    setScreen('reward');
  };

  const handleContinue = () => {
    setScreen('dashboard');
    setActiveTab('dashboard');
  };

  if (screen === 'checkin') {
    return <DailyCheckIn onBack={handleContinue} onComplete={handleContinue} />;
  }

  if (screen === 'emergency') {
    return (
      <EmergencyHelp
        onBack={() => setScreen('ride')}
        onRideUrge={() => setScreen('ride')}
        onDashboard={handleContinue}
      />
    );
  }

  if (screen === 'relapse') {
    return (
      <LogRelapse
        onBack={() => { setScreen('dashboard'); setActiveTab('dashboard'); }}
        onLogged={() => setScreen('recovery')}
      />
    );
  }

  if (screen === 'recovery') {
    return <RecoveryScreen onContinue={handleContinue} />;
  }

  if (screen === 'log') {
    return (
      <LogUrge
        onBack={() => { setScreen('dashboard'); setActiveTab('dashboard'); }}
        onRideUrge={() => setScreen('ride')}
      />
    );
  }

  if (screen === 'ride') {
    return (
      <RideTheUrge
        onResisted={handleResisted}
        onBack={() => setScreen('dashboard')}
        onStillStruggling={() => setScreen('emergency')}
      />
    );
  }

  if (screen === 'reward') {
    return <RewardScreen streak={streak} onContinue={handleContinue} />;
  }

  return (
    <div className="max-w-md mx-auto relative">
      {activeTab === 'dashboard' && (
        <Dashboard
          onRideUrge={() => { setActionHubOpen(false); setScreen('ride'); }}
          onLogUrge={() => { setActionHubOpen(false); setScreen('log'); }}
          onDailyCheckIn={() => { setScreen('checkin'); }}
        />
      )}
      {activeTab === 'insights' && <InsightsScreen />}
      {activeTab === 'community' && <ComingSoonPlaceholder title="Community" />}
      {activeTab === 'profile' && <ProfilePlaceholder />}

      <ActionHub
        open={actionHubOpen}
        onClose={() => setActionHubOpen(false)}
        onRideUrge={() => { setActionHubOpen(false); setScreen('ride'); }}
        onLogUrge={() => { setActionHubOpen(false); setScreen('log'); }}
        onLogRelapse={() => { setActionHubOpen(false); setScreen('relapse'); }}
        onEmergencyHelp={() => { setActionHubOpen(false); setScreen('emergency'); }}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setScreen(tab as Screen); }}
        onPlusPress={() => setActionHubOpen(true)}
      />
    </div>
  );
};

export default Index;
