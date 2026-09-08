import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementUnlockModal from './AchievementUnlockModal';

/** Mounted once app-wide: celebrates achievements the moment they unlock. */
const AchievementWatcher = () => {
  const { celebrating, dismissCelebration } = useAchievements();

  useEffect(() => {
    if (celebrating) {
      toast.success('Achievement unlocked', { description: celebrating.label });
    }
  }, [celebrating]);

  return <AchievementUnlockModal achievement={celebrating} onClose={dismissCelebration} />;
};

export default AchievementWatcher;
