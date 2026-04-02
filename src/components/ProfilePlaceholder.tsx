import { User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const ProfilePlaceholder = () => {
  const { streak, xp, level, levelName } = useAppStore();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-20 pb-32 px-8">
      <h1 className="font-display text-lg tracking-widest text-primary mb-12">REFORGED</h1>

      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <User size={40} className="text-muted-foreground" />
      </div>

      <h2 className="font-display text-2xl tracking-wider text-foreground mb-1">WARRIOR</h2>
      <p className="text-muted-foreground text-xs tracking-widest uppercase mb-8">
        Level {level} – {levelName}
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-secondary rounded-xl p-5 text-center">
          <p className="text-3xl font-light text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Day Streak</p>
        </div>
        <div className="bg-secondary rounded-xl p-5 text-center">
          <p className="text-3xl font-light text-primary">{xp}</p>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Total XP</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePlaceholder;
