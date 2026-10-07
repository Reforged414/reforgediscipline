import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Trophy, Check, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from '@/components/PaywallModal';
import { api, FORUM_ICONS, HANDLE_RE, generateHandles, type Forum, type CommunityProfile } from '@/lib/community';
import { Header, CrisisCard } from './Shared';
import { ForumFeed, PostComposer, PostDetail } from './Posts';
import { Leaderboard } from './Leaderboard';
import { Input } from '@/components/ui/input';

type View =
  | { name: 'hub' } | { name: 'forum'; forumId: string } | { name: 'compose'; forumId: string }
  | { name: 'post'; postId: string; from: View } | { name: 'leaderboard' };

/* ---------- handle picker ---------- */
const HandlePicker = ({ userId, onDone }: { userId: string; onDone: (p: CommunityProfile) => void }) => {
  const [custom, setCustom] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [options, setOptions] = useState(() => generateHandles(4));
  const [avail, setAvail] = useState<null | boolean>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = HANDLE_RE.test(custom);
  useEffect(() => {
    setAvail(null);
    if (!valid) return;
    const t = setTimeout(() => api.handleAvailable(custom).then(setAvail), 350);
    return () => clearTimeout(t);
  }, [custom, valid]);

  const chosen = custom ? (valid && avail ? custom : null) : picked;
  const confirm = async () => {
    if (!chosen) return;
    setBusy(true); setErr(null);
    try {
      if (!custom && !(await api.handleAvailable(chosen))) { setErr('That handle was just taken. Pick another.'); setOptions(generateHandles(4)); return; }
      await api.createProfile(userId, chosen, custom ? 'custom' : 'generated');
      onDone({ handle: chosen, handle_type: custom ? 'custom' : 'generated', leaderboard_opt_in: false, handle_updated_at: new Date().toISOString() });
    } catch (e: any) { setErr(e.message ?? 'Could not save handle.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="pb-32 px-5">
      <div className="pt-10 pb-6">
        <h1 className="font-display text-3xl tracking-[0.2em] uppercase text-foreground">Choose Your Handle</h1>
        <p className="text-sm text-muted-foreground mt-2">This is how others will see you. Your real identity stays private.</p>
      </div>
      <Input value={custom} onChange={(e) => { setCustom(e.target.value.slice(0, 24)); setPicked(null); }} placeholder="your_handle" className="h-12 text-base" />
      <div className="flex justify-between text-xs mt-2 px-1">
        <span className={custom && !valid ? 'text-destructive' : avail === false ? 'text-destructive' : avail ? 'text-primary' : 'text-muted-foreground'}>
          {custom && !valid ? 'Letters, numbers and underscores only (3–24)' : avail === false ? 'Already taken' : avail ? 'Available' : 'Letters, numbers and underscores only'}
        </span>
        <span className="text-muted-foreground">{custom.length}/24</span>
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-border flex-1" /><span className="text-xs text-muted-foreground">or pick a generated handle</span><div className="h-px bg-border flex-1" />
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((h) => (
          <button key={h} onClick={() => { setPicked(h); setCustom(''); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm border ${picked === h ? 'border-primary bg-primary/15 text-primary' : 'border-border text-foreground'}`}>
            {picked === h && <Check size={14} />}{h}
          </button>
        ))}
      </div>
      <button onClick={() => { setOptions(generateHandles(4)); setPicked(null); }} className="text-xs text-primary mt-3">Show different options</button>

      {err && <p className="text-sm text-destructive mt-4">{err}</p>}
      <button onClick={confirm} disabled={!chosen || busy}
        className="w-full mt-8 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold tracking-wider uppercase text-sm disabled:opacity-40">
        {busy ? 'Saving…' : 'Continue'}
      </button>
      <p className="text-center text-xs text-muted-foreground mt-3">You can change your handle once every 30 days.</p>
    </div>
  );
};

/* ---------- main ---------- */
const CommunityScreen = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const [profile, setProfile] = useState<CommunityProfile | null | undefined>(undefined);
  const [forums, setForums] = useState<Forum[]>([]);
  const [view, setView] = useState<View>({ name: 'hub' });
  const [paywall, setPaywall] = useState(false);
  const [crisis, setCrisis] = useState(false);

  useEffect(() => { if (user) api.myProfile(user.id).then(setProfile); }, [user]);
  useEffect(() => { if (profile && view.name === 'hub') api.forums().then(setForums); }, [profile, view.name]);
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center pb-24">
        <Users size={32} className="text-primary mb-4" />
        <h2 className="font-display text-2xl tracking-[0.2em] uppercase text-foreground">Community</h2>
        <p className="text-sm text-muted-foreground mt-2">Create an account to read and share posts with others.</p>
      </div>
    );
  }
  if (profile === undefined) return <div className="min-h-screen" />;
  if (profile === null) return <HandlePicker userId={user.id} onDone={setProfile} />;

  const ctx = { userId: user.id, isPremium, onPaywall: () => setPaywall(true) };
  const paywallEl = (
    <PaywallModal open={paywall} onClose={() => setPaywall(false)}
      extraFeatures={[{ label: 'Comment on Community Posts', desc: 'Reply to posts and support others directly' }]} />
  );

  let body: React.ReactNode;
  if (view.name === 'forum') {
    const forum = forums.find((f) => f.id === view.forumId)!;
    body = <ForumFeed forum={forum} ctx={ctx} onBack={() => setView({ name: 'hub' })}
      onCompose={() => setView({ name: 'compose', forumId: forum.id })}
      onOpenPost={(id) => setView({ name: 'post', postId: id, from: view })} />;
  } else if (view.name === 'compose') {
    body = <PostComposer forums={forums} initialForumId={view.forumId} onBack={() => setView({ name: 'forum', forumId: view.forumId })}
      onPosted={(fid, c) => { setCrisis(c); setView({ name: 'forum', forumId: fid }); }} />;
  } else if (view.name === 'post') {
    body = <PostDetail postId={view.postId} ctx={ctx} onBack={() => setView(view.from)} />;
  } else if (view.name === 'leaderboard') {
    body = <Leaderboard userId={user.id} optedIn={profile.leaderboard_opt_in}
      onOptChange={(v) => setProfile({ ...profile, leaderboard_opt_in: v })} onBack={() => setView({ name: 'hub' })} />;
  } else {
    body = (
      <div className="pb-32">
        <Header title="Community" right={<span className="text-xs text-muted-foreground truncate max-w-[40%]">@{profile.handle}</span>} />
        <div className="px-5 space-y-3">
          <button onClick={() => setView({ name: 'leaderboard' })}
            className="w-full flex items-center gap-3 bg-card border border-primary/30 rounded-2xl px-4 py-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center"><Trophy size={18} className="text-primary" /></div>
            <div className="flex-1"><p className="text-sm text-foreground font-medium">Leaderboard</p><p className="text-xs text-muted-foreground">Longest streaks and most urges resisted</p></div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold pt-3 px-1">Forums</p>
          {forums.map((f, i) => {
            const Icon = FORUM_ICONS[f.icon] ?? Users;
            return (
              <motion.button key={f.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => setView({ name: 'forum', forumId: f.id })}
                className="w-full flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-4 text-left active:scale-[0.99] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center"><Icon size={18} className="text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.description}</p>
                </div>
                <span className="text-xs text-primary shrink-0">{f.post_count} {Number(f.post_count) === 1 ? 'post' : 'posts'}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </motion.button>
            );
          })}
        </div>
        {forums[0] && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView({ name: 'compose', forumId: forums[0].id })} aria-label="New post"
            className="fixed bottom-24 right-[max(1.25rem,calc(50%-14rem+1.25rem))] z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center cta-glow-pulse">
            <Plus size={24} />
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {crisis && <div className="px-5 pt-4"><CrisisCard onClose={() => setCrisis(false)} /></div>}
      {body}
      {paywallEl}
    </div>
  );
};

export default CommunityScreen;
