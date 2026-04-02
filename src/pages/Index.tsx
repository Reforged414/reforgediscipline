import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import BottomNav from '@/components/BottomNav';
import ActionHub from '@/components/ActionHub';
import RideTheUrge from '@/components/RideTheUrge';
import RewardScreen from '@/components/RewardScreen';
import LogUrge from '@/components/LogUrge';
import ProfilePlaceholder from '@/components/ProfilePlaceholder';
import ComingSoonPlaceholder from '@/components/ComingSoonPlaceholder';
import { useAppStore } from '@/store/useAppStore';

type Screen = 'dashboard' | 'profile' | 'ride' | 'reward' | 'log';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [actionHubOpen, setActionHubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { streak, resistUrge } = useAppStore();

  const handleResisted = () => {
    resistUrge();
    setScreen('reward');
  };

  const handleContinue = () => {
    setScreen('dashboard');
    setActiveTab('dashboard');
  };

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
      />
    );
  }

  if (screen === 'reward') {
    return <RewardScreen streak={streak} onContinue={handleContinue} />;
  }

  return (
    <div className="max-w-md mx-auto relative">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'progress' && <ComingSoonPlaceholder title="Progress" />}
      {activeTab === 'community' && <ComingSoonPlaceholder title="Community" />}
      {activeTab === 'profile' && <ProfilePlaceholder />}

      <ActionHub
        open={actionHubOpen}
        onClose={() => setActionHubOpen(false)}
        onRideUrge={() => {
          setActionHubOpen(false);
          setScreen('ride');
        }}
        onLogUrge={() => {
          setActionHubOpen(false);
          setScreen('log');
        }}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setScreen(tab as Screen);
        }}
        onPlusPress={() => setActionHubOpen(true)}
      />
    </div>
  );
};

export default Index;
