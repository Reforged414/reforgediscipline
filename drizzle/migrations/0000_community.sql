
CREATE TABLE public.admin_users (user_id uuid PRIMARY KEY);
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see own row" ON public.admin_users FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = _uid) $$;

CREATE TABLE public.community_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  handle text NOT NULL,
  handle_type text NOT NULL DEFAULT 'custom' CHECK (handle_type IN ('custom','generated')),
  leaderboard_opt_in boolean NOT NULL DEFAULT false,
  handle_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT handle_format CHECK (handle ~ '^[A-Za-z0-9_]{3,24}$')
);
CREATE UNIQUE INDEX community_profiles_handle_lower ON public.community_profiles (lower(handle));
GRANT SELECT, INSERT, UPDATE ON public.community_profiles TO authenticated;
GRANT ALL ON public.community_profiles TO service_role;
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own community profile select" ON public.community_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own community profile insert" ON public.community_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own community profile update" ON public.community_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.community_handle_guard() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.handle IS DISTINCT FROM OLD.handle THEN
    IF OLD.handle_updated_at > now() - interval '30 days' THEN
      RAISE EXCEPTION 'You can change your handle once every 30 days.';
    END IF;
    NEW.handle_updated_at = now();
  END IF;
  NEW.user_id = OLD.user_id;
  RETURN NEW;
END $$;
CREATE TRIGGER community_handle_guard BEFORE UPDATE ON public.community_profiles FOR EACH ROW EXECUTE FUNCTION public.community_handle_guard();

CREATE TABLE public.forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, name text NOT NULL, description text NOT NULL, icon text NOT NULL, sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.forums TO authenticated, anon;
GRANT ALL ON public.forums TO service_role;
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Forums readable" ON public.forums FOR SELECT USING (true);
INSERT INTO public.forums (slug, name, description, icon, sort_order) VALUES
 ('daily-wins','Daily Wins','Small daily victories and check-ins','Sun',1),
 ('gym-fitness','Gym & Fitness','Workout motivation and progress','Dumbbell',2),
 ('milestones','Milestones','Streak achievements and milestones','Trophy',3),
 ('staying-strong','Staying Strong','Support through urges and cravings','Shield',4);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  forum_id uuid NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  image_url text,
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','blocked','pending_review')),
  flagged_for_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_forum_idx ON public.posts (forum_id, created_at DESC);
GRANT SELECT, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors see own posts" ON public.posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','blocked')),
  flagged_for_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_post_idx ON public.comments (post_id, created_at);
GRANT SELECT, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors see own comments" ON public.comments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('flame','thumbs_up','heart','dumbbell','trophy','sparkles','shield','mountain','zap','sun','hand_heart')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction_type)
);
GRANT SELECT, INSERT, DELETE ON public.reactions TO authenticated;
GRANT ALL ON public.reactions TO service_role;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own reactions select" ON public.reactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own reactions insert" ON public.reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own reactions delete" ON public.reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('post','comment')),
  target_id uuid NOT NULL,
  reason text CHECK (reason IS NULL OR char_length(reason) <= 500),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users file reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id AND status = 'open');
CREATE POLICY "Admins read reports" ON public.reports FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.moderation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('post','comment')),
  target_id uuid NOT NULL,
  flag_reason text NOT NULL,
  reviewed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.moderation_flags TO authenticated;
GRANT ALL ON public.moderation_flags TO service_role;
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read flags" ON public.moderation_flags FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins update flags" ON public.moderation_flags FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Public read functions: expose handle only, never user_id
CREATE OR REPLACE FUNCTION public.community_get_forums()
RETURNS TABLE (id uuid, slug text, name text, description text, icon text, sort_order int, post_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.slug, f.name, f.description, f.icon, f.sort_order,
    (SELECT count(*) FROM posts p WHERE p.forum_id = f.id AND p.status = 'visible')
  FROM forums f ORDER BY f.sort_order $$;

CREATE OR REPLACE FUNCTION public.community_get_posts(_forum_id uuid DEFAULT NULL, _sort text DEFAULT 'recent', _post_id uuid DEFAULT NULL)
RETURNS TABLE (id uuid, forum_id uuid, handle text, body text, image_url text, created_at timestamptz, is_mine boolean, comment_count bigint, reactions jsonb, my_reactions text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.forum_id, COALESCE(cp.handle, 'member'), p.body, p.image_url, p.created_at,
    p.user_id = auth.uid(),
    (SELECT count(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'visible'),
    COALESCE((SELECT jsonb_object_agg(t.reaction_type, t.n) FROM (SELECT r.reaction_type, count(*) n FROM reactions r WHERE r.post_id = p.id GROUP BY r.reaction_type) t), '{}'::jsonb),
    COALESCE((SELECT array_agg(r.reaction_type) FROM reactions r WHERE r.post_id = p.id AND r.user_id = auth.uid()), '{}')
  FROM posts p LEFT JOIN community_profiles cp ON cp.user_id = p.user_id
  WHERE auth.uid() IS NOT NULL AND p.status = 'visible'
    AND (_forum_id IS NULL OR p.forum_id = _forum_id)
    AND (_post_id IS NULL OR p.id = _post_id)
  ORDER BY CASE WHEN _sort = 'top' THEN (SELECT count(*) FROM reactions r WHERE r.post_id = p.id) END DESC NULLS LAST, p.created_at DESC
  LIMIT 100 $$;

CREATE OR REPLACE FUNCTION public.community_get_comments(_post_id uuid)
RETURNS TABLE (id uuid, handle text, body text, created_at timestamptz, is_mine boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, COALESCE(cp.handle, 'member'), c.body, c.created_at, c.user_id = auth.uid()
  FROM comments c LEFT JOIN community_profiles cp ON cp.user_id = c.user_id
  WHERE auth.uid() IS NOT NULL AND c.post_id = _post_id AND c.status = 'visible'
  ORDER BY c.created_at $$;

CREATE OR REPLACE FUNCTION public.community_handle_available(_handle text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM community_profiles WHERE lower(handle) = lower(_handle) AND user_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)) $$;

CREATE OR REPLACE FUNCTION public.community_get_leaderboard(_metric text DEFAULT 'streak')
RETURNS TABLE (rank bigint, handle text, value int, is_me boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT row_number() OVER (ORDER BY v DESC, cp.created_at), cp.handle, v, cp.user_id = auth.uid()
  FROM (
    SELECT cp.*, CASE WHEN _metric = 'resisted' THEN COALESCE(jsonb_array_length(ud.resisted_timestamps), 0) ELSE ud.streak END AS v
    FROM community_profiles cp JOIN user_data ud ON ud.user_id = cp.user_id
    WHERE cp.leaderboard_opt_in = true
  ) cp
  WHERE auth.uid() IS NOT NULL
  ORDER BY 1 LIMIT 500 $$;

CREATE OR REPLACE FUNCTION public.community_am_i_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.is_admin(auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.community_admin_target_text(_type text, _id uuid) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN NULL; END IF;
  IF _type = 'post' THEN RETURN (SELECT body FROM posts WHERE id = _id);
  ELSE RETURN (SELECT body FROM comments WHERE id = _id); END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.community_get_forums(), public.community_get_posts(uuid,text,uuid), public.community_get_comments(uuid), public.community_handle_available(text), public.community_get_leaderboard(text), public.community_am_i_admin(), public.community_admin_target_text(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid), public.community_get_forums(), public.community_get_posts(uuid,text,uuid), public.community_get_comments(uuid), public.community_handle_available(text), public.community_get_leaderboard(text), public.community_am_i_admin(), public.community_admin_target_text(text,uuid) TO authenticated;
