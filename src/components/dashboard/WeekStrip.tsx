import { motion } from 'framer-motion';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const toKey = (d: Date) => d.toISOString().split('T')[0];

interface WeekStripProps {
  checkInDates: string[];
}

/** Seven-day consistency strip: filled = checked in, outlined = missed. */
const WeekStrip = ({ checkInDates }: WeekStripProps) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const done = new Set(checkInDates);

  return (
    <div>
      <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3 text-center">This Week</p>
      <div className="flex items-center justify-center gap-3">
        {days.map((d, i) => {
          const key = toKey(d);
          const isToday = i === 6;
          const filled = done.has(key);
          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.25, ease: 'easeOut' }}
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  filled ? 'bg-primary border-primary' : 'bg-secondary/60 border-border'
                } ${isToday ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}`}
                style={filled ? { boxShadow: '0 0 12px hsl(var(--primary) / 0.45)' } : undefined}
              />
              <span className={`text-[9px] uppercase ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {DAY_LETTERS[d.getDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStrip;
