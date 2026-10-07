import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type LeaderRow } from '@/lib/community';
import { Header } from './Shared';
import OrangeToggle from '@/components/ui/OrangeToggle';

export const Leaderboard = ({ userId, optedIn, onOptChange, onBack }: {
  userId: string; optedIn: boolean; onOptChange: (v: boolean) => void; onBack: () => void;
}) => {
  const [metric, setMetric] = useState<'streak' | 'resisted'>('streak');
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  useEffect(() => { setRows(null); api.leaderboard(metric).then(setRows); }, [metric, optedIn]);

  const unit = metric === 'streak' ? 'days' : 'resisted';
  const me = rows?.find((r) => r.is_me);
  const top = rows?.slice(0, 3) ?? [];
  const rest = rows?.slice(3, 50) ?? [];
  const podium = [top[1], top[0], top[2]];
  const heights = ['h-20', 'h-28', 'h-16'];

  const toggle = async (v: boolean) => {
    await api.updateProfile(userId, { leaderboard_opt_in: v });
    onOptChange(v);
  };

  return (
    <div className="pb-40">
      <Header title="Leaderboard" onBack={onBack} />
      <div className="px-5 space-y-5">
        <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3">
          <div>
            <p className="text-sm text-foreground">Opted in</p>
            <p className="text-xs text-muted-foreground">Show your handle on the leaderboard</p>
          </div>
          <OrangeToggle enabled={optedIn} onToggle={toggle} aria-label="Opted in to leaderboard" />
        </div>

        <div className="grid grid-cols-2 bg-secondary rounded-xl p-1">
          {(['streak', 'resisted'] as const).map((m) => (
            <button key={m} onClick={() => setMetric(m)}
              className={`py-2 rounded-lg text-xs font-semibold tracking-wider uppercase ${metric === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {m === 'streak' ? 'Longest Streak' : 'Most Resisted'}
            </button>
          ))}
        </div>

        {rows === null ? <div className="h-48 rounded-2xl bg-card animate-pulse" /> : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No one has joined the leaderboard yet.</p>
        ) : (
          <>
            <div className="flex items-end justify-center gap-3 pt-4">
              {podium.map((r, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  {r && (
                    <>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-lg border ${
                        r.rank === 1 ? 'border-primary text-primary shadow-[0_0_24px_hsl(var(--primary)/0.45)]' : 'border-border text-foreground'}`}>
                        {r.handle[0]?.toUpperCase()}
                      </div>
                      <p className="text-xs text-foreground truncate max-w-full">{r.handle}</p>
                      <p className="text-xs text-primary">{r.value} {unit}</p>
                    </>
                  )}
                  <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.08, type: 'spring' }}
                    style={{ originY: 1 }}
                    className={`w-full ${heights[i]} rounded-t-xl bg-card border border-border flex items-start justify-center pt-2 font-display text-xl text-muted-foreground`}>
                    {r ? r.rank : ''}
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {rest.map((r) => (
                <div key={r.rank} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${r.is_me ? 'bg-primary/10 border border-primary/40' : 'bg-secondary'}`}>
                  <span className="w-6 text-sm text-muted-foreground">{r.rank}</span>
                  <span className="flex-1 text-sm text-foreground truncate">{r.handle}</span>
                  <span className="text-sm text-primary">{r.value} <span className="text-xs text-muted-foreground">{unit}</span></span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="fixed bottom-20 left-0 right-0 z-30">
        <div className="max-w-md mx-auto px-5 pb-3">
          <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm flex justify-between">
            {optedIn ? (
              me ? <><span className="text-foreground">Your rank: #{me.rank}</span><span className="text-primary">{me.value} {unit}</span></>
                 : <span className="text-muted-foreground">Loading your rank…</span>
            ) : <span className="text-muted-foreground">Opt in to see your rank.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
