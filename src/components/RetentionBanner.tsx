import { useAppStore } from '@/store/useAppStore';

const RetentionBanner = () => {
  const { streak, dailyDiscipline, relapseLogs } = useAppStore();

  // Check if user missed yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const hadRelapseYesterday = relapseLogs.some(
    (r) => r.timestamp.split('T')[0] === yesterdayStr
  );

  let message = '';
  let highlight = false;

  if (hadRelapseYesterday && streak === 0) {
    message = 'Yesterday was a setback. Today is Day 1 — start again.';
  } else if (streak > 0) {
    message = `You're on a ${streak}-day streak. Keep going.`;
  }

  if (!dailyDiscipline.checkedIn) {
    highlight = true;
  }

  if (!message && !highlight) return null;

  return (
    <div className="space-y-2 mb-6">
      {message && (
        <div className="bg-secondary rounded-xl px-4 py-3 border border-primary/20 animate-fade-in">
          <p className="text-sm text-foreground">{message}</p>
        </div>
      )}
      {highlight && !dailyDiscipline.checkedIn && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5 animate-fade-in">
          <p className="text-xs text-primary font-medium">📋 Don't forget your daily check-in!</p>
        </div>
      )}
    </div>
  );
};

export default RetentionBanner;
