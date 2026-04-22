import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const directionRef = useRef(1);
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    identity: [],
    lastRelapse: '',
    triggers: [],
    severity: '',
  });

  const goTo = (next: number) => {
    directionRef.current = next > step ? 1 : -1;
    setStep(next);
  };

  const goBack = () => goTo(Math.max(0, step - 1));

  const screens = [
    <WelcomeScreen key="welcome" onNext={() => goTo(1)} />,
    <GoalIdentityScreen
      key="goals"
      step={2}
      total={6}
      goals={data.goals}
      identity={data.identity}
      onBack={goBack}
      onNext={(goals, identity) => {
        setData((d) => ({ ...d, goals, identity }));
        goTo(2);
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
        goTo(3);
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
        goTo(4);
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
        goTo(5);
      }}
    />,
    <AccountScreen
      key="account"
      step={6}
      total={6}
      onBack={goBack}
      onNext={() => goTo(6)}
    />,
    <FinishScreen key="finish" onNext={() => goTo(7)} />,
    <PaywallScreen key="paywall" onComplete={() => onComplete(data)} />,
  ];

  const direction = directionRef.current;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background overflow-hidden relative">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0.6 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {screens[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
