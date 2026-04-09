import { useState, useRef, useCallback } from 'react';
import { Flame, FileText, BookOpen, AlertTriangle, Phone, ChevronRight } from 'lucide-react';

interface ActionHubProps {
  open: boolean;
  onClose: () => void;
  onRideUrge: () => void;
  onLogUrge: () => void;
  onLogRelapse: () => void;
  onEmergencyHelp: () => void;
}

const actions = [
  { icon: Flame, label: 'RIDE THE URGE', sub: 'Overcome Urge', key: 'ride' },
  { icon: FileText, label: 'LOG URGE', sub: 'Track Urges', key: 'log' },
  { icon: BookOpen, label: 'JOURNAL ENTRY', sub: 'Write Thoughts', key: 'journal' },
  { icon: AlertTriangle, label: 'LOG RELAPSE', sub: 'Reflect And Learn', key: 'relapse' },
  { icon: Phone, label: 'EMERGENCY HELP', sub: 'Get Support', key: 'emergency' },
];

const ActionHub = ({ open, onClose, onRideUrge, onLogUrge, onLogRelapse, onEmergencyHelp }: ActionHubProps) => {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  }, [dragging]);

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  }, [dragY, onClose]);

  if (!open) return null;

  const handleAction = (key: string) => {
    if (key === 'ride') onRideUrge();
    if (key === 'log') onLogUrge();
    if (key === 'relapse') onLogRelapse();
    if (key === 'emergency') onEmergencyHelp();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
            {actions.map(({ icon: Icon, label, sub, key }) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                className="w-full flex items-center gap-4 bg-secondary rounded-xl px-4 py-4 active:scale-[0.97] transition-transform"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display text-sm tracking-wider text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActionHub;
