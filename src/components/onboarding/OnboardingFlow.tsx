import { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import GoalIdentityScreen from './GoalIdentityScreen';
import LastRelapseScreen from './LastRelapseScreen';
import TriggersScreen from './TriggersScreen';
import SeverityScreen from './SeverityScreen';
import AccountScreen from './AccountScreen';
import FinishScreen from './FinishScreen';
import PaywallScreen from './PaywallScreen';

interface OnboardingData {
  goals: string[];
  identity: string[];
  lastRelapse: string;
  triggers: string[];
  severity: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    identity: [],
    lastRelapse: '',
    triggers: [],
    severity: '',
  });

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const screens = [
    <WelcomeScreen key="welcome" onNext={() => setStep(1)} />,
    <GoalIdentityScreen
      key="goals"
      step={2}
      total={6}
      goals={data.goals}
      identity={data.identity}
      onBack={goBack}
      onNext={(goals, identity) => {
        setData((d) => ({ ...d, goals, identity }));
        setStep(2);
      }}
    />,
    <LastRelapseScreen
      key="relapse"
      step={3}
      total={6}
      selected={data.lastRelapse}
      onBack={goBack}
      onNext={(lastRelapse) => {
        setData((d) => ({ ...d, lastRelapse }));
        setStep(3);
      }}
    />,
    <TriggersScreen
      key="triggers"
      step={4}
      total={6}
      selected={data.triggers}
      onBack={goBack}
      onNext={(triggers) => {
        setData((d) => ({ ...d, triggers }));
        setStep(4);
      }}
    />,
    <SeverityScreen
      key="severity"
      step={5}
      total={6}
      selected={data.severity}
      onBack={goBack}
      onNext={(severity) => {
        setData((d) => ({ ...d, severity }));
        setStep(5);
      }}
    />,
    <AccountScreen
      key="account"
      step={6}
      total={6}
      onBack={goBack}
      onNext={() => setStep(6)}
    />,
    <FinishScreen key="finish" onNext={() => setStep(7)} />,
    <PaywallScreen key="paywall" onComplete={() => onComplete(data)} />,
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      {screens[step]}
    </div>
  );
};

export default OnboardingFlow;
