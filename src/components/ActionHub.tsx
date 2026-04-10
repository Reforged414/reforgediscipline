import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, FileText, BookOpen, AlertTriangle, Phone, ChevronRight } from 'lucide-react';

interface ActionHubProps {
  open: boolean;
  onClose: () => void;
  onRideUrge: () => void;
  onLogUrge: () => void;
  onLogRelapse: () => void;
  onEmergencyHelp: () => void;
  onJournal: () => void;
}

const actions = [
  { icon: Flame, label: 'RIDE THE URGE', sub: 'Overcome Urge', key: 'ride' },
  { icon: FileText, label: 'LOG URGE', sub: 'Track Urges', key: 'log' },
  { icon: BookOpen, label: 'JOURNAL ENTRY', sub: 'Write Thoughts', key: 'journal' },
  { icon: AlertTriangle, label: 'LOG RELAPSE', sub: 'Reflect And Learn', key: 'relapse' },
  { icon: Phone, label: 'EMERGENCY HELP', sub: 'Get Support', key: 'emergency' },
];

const ActionHub = ({ open, onClose, onRideUrge, onLogUrge, onLogRelapse, onEmergencyHelp, onJournal }: ActionHubProps) => {
  const handleAction = (key: string) => {
    if (key === 'ride') onRideUrge();
    if (key === 'log') onLogUrge();
    if (key === 'journal') onJournal();
    if (key === 'relapse') onLogRelapse();
    if (key === 'emergency') onEmergencyHelp();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="bg-card rounded-t-3xl px-5 pt-6 pb-8 max-w-md mx-auto">
              {/* Drag handle */}
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6 cursor-grab" />

              <h2 className="font-display text-2xl tracking-wider text-center text-foreground">
                TAKE ACTION
              </h2>
              <p className="text-muted-foreground text-xs tracking-widest text-center mt-1 mb-6 uppercase">
                Strengthen your discipline. Take action now.
              </p>

              <div className="space-y-3">
                {actions.map(({ icon: Icon, label, sub, key }, i) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                    onClick={() => handleAction(key)}
                    className="w-full flex items-center gap-4 bg-secondary rounded-xl px-4 py-4 active:scale-[0.97] transition-transform"
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-display text-sm tracking-wider text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActionHub;
