import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, CalendarDays } from 'lucide-react';

const toKey = (d: Date) => d.toISOString().split('T')[0];
const WEEKS = 12;

interface HistorySectionProps {
  checkInDates: string[];
  relapseDates: string[];
}

type Cell = { key: string; state: 'clean' | 'relapse' | 'none'; future: boolean };

/** Collapsible GitHub-style history heatmap. */
const HistorySection = ({ checkInDates, relapseDates }: HistorySectionProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const columns = useMemo(() => {
    const clean = new Set(checkInDates);
    const relapse = new Set(relapseDates);
    const today = new Date();
    // End on the Saturday of the current week so columns align to weeks.
    const end = new Date(today);
    end.setDate(today.getDate() + (6 - today.getDay()));

    const cols: Cell[][] = [];
    for (let w = WEEKS - 1; w >= 0; w--) {
      const col: Cell[] = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date(end);
        date.setDate(end.getDate() - (w * 7 + d));
        const key = toKey(date);
        col.push({
          key,
          state: relapse.has(key) ? 'relapse' : clean.has(key) ? 'clean' : 'none',
          future: date > today,
        });
      }
      cols.push(col);
    }
    return cols;
  }, [checkInDates, relapseDates]);

  return (
    <div>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center gap-3 bg-secondary/70 border border-border/60 rounded-xl px-4 py-3 shadow-[0_2px_12px_hsl(0_0%_0%_/_0.35)]"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <CalendarDays size={18} />
        </div>
        <span className="flex-1 text-left font-display text-base tracking-widest text-foreground">HISTORY</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-muted-foreground">
          <ChevronDown size={18} />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="history"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-secondary/70 border border-border/60 rounded-xl p-4 shadow-[0_2px_12px_hsl(0_0%_0%_/_0.35)]">
              <div className="flex gap-1 overflow-x-auto pb-1">
                {columns.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-1">
                    {col.map((cell) => (
                      <button
                        key={cell.key}
                        onClick={() => setSelected(selected === cell.key ? null : cell.key)}
                        aria-label={cell.key}
                        className={`w-3.5 h-3.5 rounded-[3px] transition-transform active:scale-90 ${
                          cell.future
                            ? 'bg-transparent'
                            : cell.state === 'clean'
                            ? 'bg-primary'
                            : cell.state === 'relapse'
                            ? 'bg-destructive/50'
                            : 'bg-background'
                        } ${selected === cell.key ? 'ring-1 ring-primary' : ''}`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="mt-3 text-xs text-foreground"
                  >
                    {new Date(selected + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' — '}
                    <span className="text-muted-foreground">
                      {columns.flat().find((c) => c.key === selected)?.state === 'clean'
                        ? 'Clean day logged'
                        : columns.flat().find((c) => c.key === selected)?.state === 'relapse'
                        ? 'Relapse logged'
                        : 'No data'}
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-primary" />Clean</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-destructive/50" />Relapse</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] bg-background" />No data</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistorySection;
