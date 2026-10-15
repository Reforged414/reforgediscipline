REVOKE INSERT ON public.comments FROM authenticated;
CREATE OR REPLACE FUNCTION public.comments_require_premium()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN
  IF NOT public.is_premium(NEW.user_id) THEN
    RAISE EXCEPTION 'PREMIUM_REQUIRED: Commenting is a Premium feature.';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.comments_require_premium() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER comments_require_premium BEFORE INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.comments_require_premium();