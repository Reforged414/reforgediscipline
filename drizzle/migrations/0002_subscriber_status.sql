CREATE TABLE public.subscriber_status (
  user_id uuid PRIMARY KEY,
  is_premium boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriber_status TO authenticated;
GRANT ALL ON public.subscriber_status TO service_role;
ALTER TABLE public.subscriber_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own subscriber status" ON public.subscriber_status FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_premium(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT is_premium FROM public.subscriber_status WHERE user_id = _uid), false) $$;
REVOKE EXECUTE ON FUNCTION public.is_premium(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_premium(uuid) TO authenticated;

GRANT INSERT ON public.comments TO authenticated;
CREATE POLICY "Premium users insert own comments" ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_premium(auth.uid()));