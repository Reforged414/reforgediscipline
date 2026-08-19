import { useAppStore } from '@/store/useAppStore';

/**
 * Only surfaces the daily check-in reminder. The streak itself is already
 * communicated by the large streak number on the dashboard.
 */
const RetentionBanner = () => {
  const { dailyDiscipline } = useAppStore();

  if (dailyDiscipline.checkedIn) return null;

  return (
    <div className="mb-6">
      <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5 animate-fade-in">
        <p className="text-xs text-primary font-medium">📋 Don't forget your daily check-in!</p>
      </div>
    </div>
  );
};

export default RetentionBanner;
