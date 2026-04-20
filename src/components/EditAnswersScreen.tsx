import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import GoalIdentityScreen from './onboarding/GoalIdentityScreen';
import LastRelapseScreen from './onboarding/LastRelapseScreen';
import TriggersScreen from './onboarding/TriggersScreen';
import SeverityScreen from './onboarding/SeverityScreen';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/hooks/use-toast';

interface Props {
  onBack: () => void;
}

type Section = 'menu' | 'goals' | 'lastRelapse' | 'triggers' | 'severity';

const EditAnswersScreen = ({ onBack }: Props) => {
  const { onboardingData, updateOnboardingData } = useAppStore();
  const [section, setSection] = useState<Section>('menu');

  const data = onboardingData ?? { goals: [], identity: [], lastRelapse: '', triggers: [], severity: '' };

  const saveAndReturn = (label: string) => {
    toast({ title: 'Saved', description: `${label} updated.` });
    setSection('menu');
  };

  if (section === 'goals') {
    return (
      <GoalIdentityScreen
        step={1}
        total={1}
        editMode
        goals={data.goals}
        identity={data.identity}
        onBack={() => setSection('menu')}
        onNext={(goals, identity) => {
          updateOnboardingData({ goals, identity });
          saveAndReturn('Goals');
        }}
      />
    );
  }
  if (section === 'lastRelapse') {
    return (
      <LastRelapseScreen
        step={1}
        total={1}
        editMode
        selected={data.lastRelapse}
        onBack={() => setSection('menu')}
        onNext={(lastRelapse) => {
          updateOnboardingData({ lastRelapse });
          saveAndReturn('Last relapse');
        }}
      />
    );
  }
  if (section === 'triggers') {
    return (
      <TriggersScreen
        step={1}
        total={1}
        editMode
        selected={data.triggers}
        onBack={() => setSection('menu')}
        onNext={(triggers) => {
          updateOnboardingData({ triggers });
          saveAndReturn('Triggers');
        }}
      />
    );
  }
  if (section === 'severity') {
    return (
      <SeverityScreen
        step={1}
        total={1}
        editMode
        selected={data.severity}
        onBack={() => setSection('menu')}
        onNext={(severity) => {
          updateOnboardingData({ severity });
          saveAndReturn('Severity');
        }}
      />
    );
  }

  const items: { id: Section; label: string; value: string }[] = [
    { id: 'goals', label: 'Primary Goal', value: data.goals.length ? `${data.goals.length} selected` : 'Not set' },
    { id: 'lastRelapse', label: 'Last Relapse', value: data.lastRelapse || 'Not set' },
    { id: 'triggers', label: 'Triggers', value: data.triggers.length ? `${data.triggers.length} selected` : 'Not set' },
    { id: 'severity', label: 'Severity', value: data.severity || 'Not set' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={onBack} className="text-foreground p-1" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-xl tracking-wider text-foreground">Edit My Answers</h1>
      </div>
      <p className="px-5 text-xs text-muted-foreground mb-6">Update your onboarding selections at any time.</p>

      <div className="px-5 space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setSection(it.id)}
            className="w-full flex items-center justify-between bg-secondary rounded-xl px-4 py-4 text-left active:scale-[0.99] transition-transform"
          >
            <div>
              <p className="text-foreground text-sm">{it.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5 capitalize">{it.value}</p>
            </div>
            <span className="text-primary text-xs tracking-widest">EDIT</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditAnswersScreen;
