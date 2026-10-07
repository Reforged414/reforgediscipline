import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from './Shared';
import { timeAgo } from '@/lib/community';

const db = supabase as any;
interface Item { id: string; target_type: string; target_id: string; reason: string; created_at: string; text?: string | null }

const ModerationQueue = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<'flags' | 'reports'>('flags');
  const [items, setItems] = useState<Item[] | null>(null);

  const load = async () => {
    setItems(null);
    const { data } = tab === 'flags'
      ? await db.from('moderation_flags').select('*').eq('reviewed', false).order('created_at', { ascending: false })
      : await db.from('reports').select('*').eq('status', 'open').order('created_at', { ascending: false });
    const rows: Item[] = (data ?? []).map((r: any) => ({ ...r, reason: r.flag_reason ?? r.reason ?? 'No reason given' }));
    await Promise.all(rows.map(async (r) => {
      const { data: t } = await db.rpc('community_admin_target_text', { _type: r.target_type, _id: r.target_id });
      r.text = t;
    }));
    setItems(rows);
  };
  useEffect(() => { load(); }, [tab]);

  const act = async (id: string, action: 'reviewed' | 'dismissed') => {
    if (tab === 'flags') await db.from('moderation_flags').update({ reviewed: true }).eq('id', id);
    else await db.from('reports').update({ status: action }).eq('id', id);
    setItems((c) => c?.filter((x) => x.id !== id) ?? null);
  };

  return (
    <div className="min-h-screen pb-32">
      <Header title="Flagged Content" onBack={onBack} />
      <div className="px-5 space-y-4">
        <div className="grid grid-cols-2 bg-secondary rounded-xl p-1">
          {(['flags', 'reports'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-2 rounded-lg text-xs font-semibold ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
              {t === 'flags' ? 'Auto-Flagged' : 'User Reports'}
            </button>
          ))}
        </div>
        {items === null && <p className="text-sm text-muted-foreground">Loading…</p>}
        {items?.length === 0 && <p className="text-sm text-muted-foreground">Nothing to review.</p>}
        {items?.map((i) => (
          <div key={i.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground">{i.target_type} · {i.reason} · {timeAgo(i.created_at)}</p>
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">{i.text ?? '(deleted)'}</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => act(i.id, 'reviewed')} className="bg-primary text-primary-foreground text-xs font-semibold rounded-lg px-3 py-2">Mark reviewed</button>
              <button onClick={() => act(i.id, 'dismissed')} className="border border-border text-xs rounded-lg px-3 py-2 text-foreground">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModerationQueue;
