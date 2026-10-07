import { supabase } from '@/integrations/supabase/client';
import {
  Flame, ThumbsUp, Heart, Dumbbell, Trophy, Sparkles, Shield, Mountain, Zap, Sun, HandHeart,
} from 'lucide-react';

const db = supabase as any;

export const REACTIONS = [
  { key: 'flame', icon: Flame, label: 'Fire' },
  { key: 'thumbs_up', icon: ThumbsUp, label: 'Nice' },
  { key: 'heart', icon: Heart, label: 'Support' },
  { key: 'dumbbell', icon: Dumbbell, label: 'Strong' },
  { key: 'trophy', icon: Trophy, label: 'Win' },
  { key: 'sparkles', icon: Sparkles, label: 'Inspiring' },
  { key: 'shield', icon: Shield, label: 'Steady' },
  { key: 'mountain', icon: Mountain, label: 'Climbing' },
  { key: 'zap', icon: Zap, label: 'Energy' },
  { key: 'sun', icon: Sun, label: 'Bright' },
  { key: 'hand_heart', icon: HandHeart, label: 'Here for you' },
] as const;
export const FREE_REACTION_COUNT = 5;

export const FORUM_ICONS: Record<string, any> = { Sun, Dumbbell, Trophy, Shield };

export interface Forum { id: string; slug: string; name: string; description: string; icon: string; post_count: number }
export interface Post {
  id: string; forum_id: string; handle: string; body: string; image_url: string | null; created_at: string;
  is_mine: boolean; comment_count: number; reactions: Record<string, number>; my_reactions: string[];
}
export interface Comment { id: string; handle: string; body: string; created_at: string; is_mine: boolean }
export interface CommunityProfile { handle: string; handle_type: string; leaderboard_opt_in: boolean; handle_updated_at: string }
export interface LeaderRow { rank: number; handle: string; value: number; is_me: boolean }

export const HANDLE_RE = /^[A-Za-z0-9_]{3,24}$/;

const WORDS_A = ['Steady', 'Quiet', 'Iron', 'Calm', 'Bright', 'Clear', 'Rising', 'Silent', 'Patient', 'Brave'];
const WORDS_B = ['Will', 'Path', 'Forge', 'Mind', 'Oak', 'River', 'Climber', 'Stone', 'Harbor', 'Ridge'];
export const generateHandles = (n = 4) =>
  Array.from({ length: n }, () =>
    `${WORDS_A[Math.floor(Math.random() * WORDS_A.length)]}_${WORDS_B[Math.floor(Math.random() * WORDS_B.length)]}_${Math.floor(Math.random() * 9000 + 10)}`);

export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const api = {
  async myProfile(userId: string): Promise<CommunityProfile | null> {
    const { data } = await db.from('community_profiles').select('handle,handle_type,leaderboard_opt_in,handle_updated_at').eq('user_id', userId).maybeSingle();
    return data;
  },
  async handleAvailable(handle: string): Promise<boolean> {
    const { data } = await db.rpc('community_handle_available', { _handle: handle });
    return !!data;
  },
  async createProfile(userId: string, handle: string, type: 'custom' | 'generated') {
    const { error } = await db.from('community_profiles').insert({ user_id: userId, handle, handle_type: type });
    if (error) throw error;
  },
  async updateProfile(userId: string, patch: Partial<CommunityProfile>) {
    const { error } = await db.from('community_profiles').update(patch).eq('user_id', userId);
    if (error) throw error;
  },
  async forums(): Promise<Forum[]> {
    const { data } = await db.rpc('community_get_forums');
    return data ?? [];
  },
  async posts(forumId: string, sort: 'recent' | 'top'): Promise<Post[]> {
    const { data } = await db.rpc('community_get_posts', { _forum_id: forumId, _sort: sort });
    return data ?? [];
  },
  async post(postId: string): Promise<Post | null> {
    const { data } = await db.rpc('community_get_posts', { _post_id: postId });
    return data?.[0] ?? null;
  },
  async comments(postId: string): Promise<Comment[]> {
    const { data } = await db.rpc('community_get_comments', { _post_id: postId });
    return data ?? [];
  },
  async toggleReaction(userId: string, postId: string, type: string, on: boolean) {
    if (on) await db.from('reactions').insert({ user_id: userId, post_id: postId, reaction_type: type });
    else await db.from('reactions').delete().eq('user_id', userId).eq('post_id', postId).eq('reaction_type', type);
  },
  async submit(payload: { kind: 'post' | 'comment'; forum_id?: string; post_id?: string; body: string; image_base64?: string | null }) {
    const { data, error } = await supabase.functions.invoke('community-submit', { body: payload });
    if (error) return { error: 'Something went wrong. Try again.' } as any;
    return data as { id?: string; crisis?: boolean; blocked?: boolean; image_rejected?: boolean; error?: string };
  },
  async report(userId: string, type: 'post' | 'comment', id: string, reason?: string) {
    const { error } = await db.from('reports').insert({ reporter_user_id: userId, target_type: type, target_id: id, reason: reason || null });
    if (error) throw error;
  },
  async deletePost(id: string) { await db.from('posts').delete().eq('id', id); },
  async leaderboard(metric: 'streak' | 'resisted'): Promise<LeaderRow[]> {
    const { data } = await db.rpc('community_get_leaderboard', { _metric: metric });
    return data ?? [];
  },
  async isAdmin(): Promise<boolean> {
    const { data } = await db.rpc('community_am_i_admin');
    return !!data;
  },
  async imageUrl(path: string): Promise<string | null> {
    const { data } = await supabase.storage.from('community-images').createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  },
};

export async function fileToDataUrl(file: File, max = 1280): Promise<string> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}
