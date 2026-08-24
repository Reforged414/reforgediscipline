import { motion } from 'framer-motion';

interface Trigger {
  label: string;
  pct: number;
  count?: number;
}

const TriggerLeaderboard = ({
  triggers,
  emptyText,
}: {
  triggers: Trigger[];
  emptyText: string;
}) => {
  const hasData = triggers.length > 0;
  const rows = hasData ? triggers : [{ label: '—', pct: 0 }, { label: '—', pct: 0 }, { label: '—', pct: 0 }];

  return (
    <div className="bg-secondary rounded-2xl p-4">
      <div className="space-y-3">
        {rows.map((t, i) => (
          <div key={`${t.label}-${i}`} className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                hasData ? 'bg-primary/15 text-primary' : 'bg-border/40 text-muted-foreground/50'
              }`}
            >
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm truncate ${
                    hasData ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}
                >
                  {hasData ? t.label : '\u00A0'}
                </span>
                {hasData && (
                  <span className="text-xs text-primary ml-2 shrink-0">
                    {t.pct}%{t.count != null ? ` · ${t.count}` : ''}
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-border/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: hasData
                      ? 'linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary)))'
                      : 'transparent',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${t.pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.08 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasData && (
        <p className="text-xs text-muted-foreground italic leading-relaxed mt-4">{emptyText}</p>
      )}
    </div>
  );
};

export default TriggerLeaderboard;
