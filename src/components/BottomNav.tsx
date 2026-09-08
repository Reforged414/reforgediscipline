import { Fragment } from 'react';
import { motion } from 'framer-motion';
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
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
      {/* Floating action button — in-flow above the tab bar, always a clear gap */}
      <motion.button
        onClick={onPlusPress}
        whileTap={{ scale: 0.97 }}
        aria-label="Take action"
        className="pointer-events-auto mb-3 w-14 h-14 shrink-0 rounded-full bg-primary flex items-center justify-center shadow-lg animate-pulse-glow ring-4 ring-background"
      >
        <span className="text-primary-foreground text-3xl font-light leading-none">+</span>
      </motion.button>

      <nav className="pointer-events-auto w-full bg-card/95 backdrop-blur-md border-t border-border px-2 sm:px-6 pb-6 pt-3">
        <div className="flex justify-around items-center max-w-md mx-auto gap-1">
          {TABS.map(({ id, label, icon: Icon, tutorial }) => (
            <Fragment key={id}>
              <motion.button
                data-tutorial={tutorial}
                onClick={() => onTabChange(id)}
                whileTap={{ scale: 0.97 }}
                aria-label={label}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 min-w-0 transition-colors ${
                  activeTab === id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon size={20} />
                <span className="text-[9px] uppercase tracking-wider truncate">{label}</span>
              </motion.button>
            </Fragment>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;
