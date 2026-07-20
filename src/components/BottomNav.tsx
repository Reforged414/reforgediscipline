import { Fragment } from 'react';
import { LayoutDashboard, BarChart3, ShieldCheck, Users, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onPlusPress: () => void;
}

const TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, tutorial: undefined },
  { id: 'insights', label: 'Insights', icon: BarChart3, tutorial: 'insights-tab' },
  { id: 'shield', label: 'Shield', icon: ShieldCheck, tutorial: undefined },
  { id: 'community', label: 'Community', icon: Users, tutorial: undefined },
  { id: 'profile', label: 'Profile', icon: User, tutorial: 'profile-tab' },
] as const;

const BottomNav = ({ activeTab, onTabChange, onPlusPress }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Plus button floating above */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onPlusPress}
          aria-label="Take action"
          className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-glow active:scale-95 transition-transform"
        >
          <span className="text-primary-foreground text-3xl font-light leading-none">+</span>
        </button>
      </div>

      <nav className="bg-card/95 backdrop-blur-md border-t border-border px-2 sm:px-6 pb-6 pt-3">
        <div className="flex justify-around items-center max-w-md mx-auto gap-1">
          {TABS.map(({ id, label, icon: Icon, tutorial }, i) => (
            <Fragment key={id}>
              {/* spacer for the floating plus button between the 2nd and 3rd tab */}
              {i === 2 && <div className="w-14 shrink-0" />}
              <button
                data-tutorial={tutorial}
                onClick={() => onTabChange(id)}
                aria-label={label}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 min-w-0 transition-colors ${
                  activeTab === id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon size={20} />
                <span className="text-[9px] uppercase tracking-wider truncate">{label}</span>
              </button>
            </Fragment>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
