import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, MoreHorizontal, ImagePlus, X, ChevronDown, Send, Trash2, Flag } from 'lucide-react';
import { api, REACTIONS, FREE_REACTION_COUNT, timeAgo, fileToDataUrl, type Forum, type Post, type Comment } from '@/lib/community';
import { Header, SignedImage, CrisisCard, LockedComment } from './Shared';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Ctx { userId: string; isPremium: boolean; onPaywall: () => void }

/* ---------- reactions ---------- */
export const ReactionBar = ({ post, ctx, onChange }: { post: Post; ctx: Ctx; onChange: (p: Post) => void }) => {
  const set = ctx.isPremium ? REACTIONS : REACTIONS.slice(0, FREE_REACTION_COUNT);
  const toggle = async (key: string) => {
    const on = !post.my_reactions.includes(key);
    const next: Post = {
      ...post,
      my_reactions: on ? [...post.my_reactions, key] : post.my_reactions.filter((k) => k !== key),
      reactions: { ...post.reactions, [key]: Math.max(0, (post.reactions[key] ?? 0) + (on ? 1 : -1)) },
    };
    onChange(next);
    await api.toggleReaction(ctx.userId, post.id, key, on);
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {set.map(({ key, icon: Icon, label }) => {
        const mine = post.my_reactions.includes(key);
        const n = post.reactions[key] ?? 0;
        return (
          <motion.button
            key={key} whileTap={{ scale: 0.85 }} onClick={() => toggle(key)} aria-label={label} aria-pressed={mine}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs border transition-colors ${
              mine ? 'border-primary/60 bg-primary/15 text-primary' : 'border-border text-muted-foreground'}`}
          >
            <Icon size={13} />{n > 0 && <span>{n}</span>}
          </motion.button>
        );
      })}
      {!ctx.isPremium && (
        <button onClick={ctx.onPaywall} className="text-[10px] tracking-wider uppercase text-primary/80 px-1">+6 more</button>
      )}
    </div>
  );
};

/* ---------- post card ---------- */
export const PostCard = ({ post, ctx, onOpen, onChange }: { post: Post; ctx: Ctx; onOpen?: () => void; onChange: (p: Post) => void }) => (
  <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
        {post.handle[0]?.toUpperCase()}
      </div>
      <p className="text-sm text-foreground font-medium truncate">{post.handle}</p>
      <span className="text-xs text-muted-foreground">· {timeAgo(post.created_at)}</span>
    </div>
    <button onClick={onOpen} disabled={!onOpen} className="block text-left w-full space-y-3">
      <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">{post.body}</p>
      {post.image_url && <SignedImage path={post.image_url} />}
    </button>
    <div className="flex items-end justify-between gap-2">
      <ReactionBar post={post} ctx={ctx} onChange={onChange} />
      <button onClick={onOpen} className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <MessageCircle size={14} />{post.comment_count}
      </button>
    </div>
  </div>
);

/* ---------- forum feed ---------- */
export const ForumFeed = ({ forum, ctx, onBack, onCompose, onOpenPost }: {
  forum: Forum; ctx: Ctx; onBack: () => void; onCompose: () => void; onOpenPost: (id: string) => void;
}) => {
  const [sort, setSort] = useState<'recent' | 'top'>('recent');
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => { setPosts(null); api.posts(forum.id, sort).then(setPosts); }, [forum.id, sort]);
  return (
    <div className="pb-32">
      <Header title={forum.name} onBack={onBack} right={
        <button onClick={onCompose} aria-label="New post" className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Plus size={18} /></button>
      } />
      <div className="px-5 flex gap-2 mb-4">
        {(['recent', 'top'] as const).map((s) => (
          <button key={s} onClick={() => setSort(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${sort === s ? 'bg-primary/15 border-primary/50 text-primary' : 'border-border text-muted-foreground'}`}>
            {s === 'recent' ? 'Recent' : 'Top'}
          </button>
        ))}
      </div>
      <div className="px-5 space-y-3">
        {posts === null && [0, 1].map((i) => <div key={i} className="h-36 rounded-2xl bg-card animate-pulse" />)}
        {posts?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">No posts yet. Be the first to share.</p>
          </div>
        )}
        {posts?.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <PostCard post={p} ctx={ctx} onOpen={() => onOpenPost(p.id)}
              onChange={(np) => setPosts((cur) => cur?.map((x) => (x.id === np.id ? np : x)) ?? null)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ---------- composer ---------- */
export const PostComposer = ({ forums, initialForumId, onBack, onPosted }: {
  forums: Forum[]; initialForumId: string; onBack: () => void; onPosted: (forumId: string, crisis: boolean) => void;
}) => {
  const [forumId, setForumId] = useState(initialForumId);
  const [body, setBody] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const forum = forums.find((f) => f.id === forumId);

  const submit = async () => {
    setBusy(true); setError(null);
    const res = await api.submit({ kind: 'post', forum_id: forumId, body: body.trim(), image_base64: image });
    setBusy(false);
    if (res.image_rejected) { setImage(null); setError("This image couldn't be uploaded."); return; }
    if (res.error) { setError(res.error); return; }
    onPosted(forumId, !!res.crisis);
  };

  return (
    <div className="pb-32 min-h-screen flex flex-col">
      <Header title="New Post" onBack={onBack} right={
        <button onClick={submit} disabled={!body.trim() || busy}
          className="bg-primary text-primary-foreground text-xs font-semibold tracking-wider uppercase rounded-full px-4 py-2 disabled:opacity-40">
          {busy ? 'Checking…' : 'Post'}
        </button>
      } />
      <div className="px-5 space-y-4 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-2 bg-secondary rounded-xl px-4 py-3 text-sm">
            <span className="text-muted-foreground">Posting in:</span>
            <span className="text-primary font-medium flex-1 text-left">{forum?.name}</span>
            <ChevronDown size={16} className="text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {forums.map((f) => <DropdownMenuItem key={f.id} onClick={() => setForumId(f.id)}>{f.name}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>

        <textarea value={body} onChange={(e) => setBody(e.target.value.slice(0, 2000))} rows={8}
          placeholder="Share something uplifting..."
          className="w-full bg-card border border-border rounded-xl p-4 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <p className="text-right text-[11px] text-muted-foreground -mt-2">{body.length}/2000</p>

        {image && (
          <div className="relative">
            <img src={image} alt="Selected" className="w-full rounded-xl max-h-64 object-cover" />
            <button onClick={() => setImage(null)} aria-label="Remove photo" className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5"><X size={14} /></button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImage(await fileToDataUrl(f)); e.target.value = ''; }} />
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground">
          <ImagePlus size={16} className="text-primary" /> Add Photo
        </button>

        {error && <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>}

        <p className="text-sm text-muted-foreground">Keep it positive — Reforged is a space for support, not venting.</p>
      </div>
      <p className="px-5 pt-6 text-center text-[11px] tracking-wide text-muted-foreground/70">Posts are reviewed to keep this space safe.</p>
    </div>
  );
};

/* ---------- post detail ---------- */
export const PostDetail = ({ postId, ctx, crisisInitially, onBack }: { postId: string; ctx: Ctx; crisisInitially?: boolean; onBack: () => void }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [crisis, setCrisis] = useState(!!crisisInitially);

  const load = () => { api.post(postId).then(setPost); api.comments(postId).then(setComments); };
  useEffect(load, [postId]);

  const report = async (type: 'post' | 'comment', id: string) => {
    try { await api.report(ctx.userId, type, id); toast({ title: 'Reported', description: 'Thanks — we will take a look.' }); }
    catch { toast({ title: 'Could not report', variant: 'destructive' }); }
  };

  const send = async () => {
    setBusy(true);
    const res = await api.submit({ kind: 'comment', post_id: postId, body: text.trim() });
    setBusy(false);
    if (res.error) { toast({ title: res.error, variant: 'destructive' }); return; }
    setText('');
    if (res.crisis) setCrisis(true);
    load();
  };

  return (
    <div className="pb-48">
      <Header title="Post" onBack={onBack} right={post && (
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More" className="p-1 text-foreground"><MoreHorizontal size={20} /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {post.is_mine ? (
              <DropdownMenuItem onClick={async () => { await api.deletePost(post.id); onBack(); }}><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => report('post', post.id)}><Flag size={14} className="mr-2" />Report</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )} />
      <div className="px-5 space-y-4">
        {crisis && <CrisisCard onClose={() => setCrisis(false)} />}
        {post ? <PostCard post={post} ctx={ctx} onChange={setPost} /> : <div className="h-40 rounded-2xl bg-card animate-pulse" />}
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary font-semibold pt-2">Comments ({comments.length})</p>
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="bg-secondary rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-foreground font-medium">{c.handle}</span>
                <span className="text-muted-foreground">· {timeAgo(c.created_at)}</span>
                {!c.is_mine && <button onClick={() => report('comment', c.id)} className="ml-auto text-muted-foreground hover:text-foreground">Report</button>}
              </div>
              <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-20 left-0 right-0 z-30">
        <div className="max-w-md mx-auto px-5 py-3 bg-background/95 backdrop-blur border-t border-border">
          {ctx.isPremium ? (
            <div className="flex items-center gap-2">
              <input value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} placeholder="Add a supportive comment..."
                onKeyDown={(e) => { if (e.key === 'Enter' && text.trim() && !busy) send(); }}
                className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={send} disabled={!text.trim() || busy} aria-label="Send"
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"><Send size={16} /></button>
            </div>
          ) : <LockedComment onUnlock={ctx.onPaywall} />}
        </div>
      </div>
    </div>
  );
};
