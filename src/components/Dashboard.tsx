import React from 'react';
import { Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface DashboardProps {
  onRideUrge?: () => void;
  onLogUrge?: () => void;
}


const Dashboard = ({ onRideUrge, onLogUrge }: DashboardProps) => {
  const { streak, xp, level, levelName, xpForNextLevel, dailyDiscipline, checkNewDay, completeDailyCheckIn } = useAppStore();

  // Check for new day on render
  React.useEffect(() => {
    checkNewDay();
  }, [checkNewDay]);

  const prevLevelXp = xpForNextLevel - 1000; // rough approximation
  const xpProgress = Math.min(((xp - Math.max(prevLevelXp, 0)) / (xpForNextLevel - Math.max(prevLevelXp, 0))) * 100, 100);

  return (
    <div className="min-h-screen bg-background px-5 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-xl tracking-widest text-primary">REFORGED</h1>
        <Settings size={20} className="text-muted-foreground" />
      </div>

      {/* Streak */}
      <div className="text-center mb-10">
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mb-2">
          Current Streak
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-7xl font-light text-foreground">{streak}</span>
          <span className="text-3xl font-display text-primary">Days</span>
        </div>
        <p className="text-4xl font-light text-foreground -mt-1">Clean</p>
        <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase mt-3">
          Your discipline is growing.
        </p>
      </div>

      {/* Level */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-lg italic text-foreground">
            <span className="font-semibold">Level {level}</span> – {levelName}
          </p>
          <p className="text-[10px] text-muted-foreground tracking-wider">
            {xp} / {xpForNextLevel} XP
          </p>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{
              width: `${xpProgress}%`,
              boxShadow: '0 0 10px hsl(25 95% 53% / 0.5)',
            }}
          />
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 mb-10">
        <button onClick={onRideUrge} className="w-full py-4 rounded-xl bg-primary text-center active:scale-[0.98] transition-transform">
          <span className="font-display text-lg tracking-wider text-primary-foreground">
            RIDE THE URGE
          </span>
        </button>
        <button onClick={onLogUrge} className="w-full py-4 rounded-xl border border-border text-center active:scale-[0.98] transition-transform">
          <span className="font-display text-sm tracking-wider text-foreground">LOG URGE</span>
        </button>
      </div>

      {/* Daily Discipline */}
      <div className="mb-8">
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">
          Daily Discipline
        </p>
        <div className="space-y-3">
          {[
            { label: 'Daily check-in', xp: '+15 XP', done: dailyDiscipline.checkedIn, action: () => completeDailyCheckIn() },
            { label: 'Resist one urge', xp: '+10 XP', done: dailyDiscipline.resistedUrge },
            { label: 'Write a reflection', xp: '+15 XP', done: dailyDiscipline.wroteReflection },
          ].map((task) => (
            <div key={task.label} className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                task.done ? 'bg-primary border-primary' : 'border-muted-foreground/40'
              }`}>
                {task.done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className={`flex-1 text-sm ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.label}
              </span>
              <span className="text-primary text-xs">{task.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-secondary rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Next Milestone</p>
          <p className="text-lg italic text-foreground font-semibold">
            {streak < 21 ? '21' : streak < 60 ? '60' : '90'} Days Clean
          </p>
        </div>
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{
              width: `${Math.min((streak / (streak < 21 ? 21 : streak < 60 ? 60 : 90)) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
