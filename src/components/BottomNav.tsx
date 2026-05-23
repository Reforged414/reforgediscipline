import { LayoutDashboard, BarChart3, ShieldCheck, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPlusPress: () => void;
}

const BottomNav = ({ activeTab, onTabChange, onPlusPress }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Plus button floating above */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onPlusPress}
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-glow active:scale-95 transition-transform"
        >
          <span className="text-primary-foreground text-3xl font-light leading-none">+</span>
        </button>
      </div>

      <nav className="bg-card/95 backdrop-blur-md border-t border-border px-6 pb-6 pt-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] uppercase tracking-widest">Dashboard</span>
          </button>

          <button
            data-tutorial="insights-tab"
            onClick={() => onTabChange('insights')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'insights' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <BarChart3 size={20} />
            <span className="text-[10px] uppercase tracking-widest">Insights</span>
          </button>

          <div className="w-14" /> {/* spacer for plus button */}

          <button
            onClick={() => onTabChange('shield')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'shield' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <ShieldCheck size={20} />
            <span className="text-[10px] uppercase tracking-widest">Shield</span>
          </button>

          <button
            data-tutorial="profile-tab"
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] uppercase tracking-widest">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
