
-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'pro_plus');

-- Add subscription fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  ADD COLUMN generation_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Function to reset generation count (can be called monthly)
CREATE OR REPLACE FUNCTION public.reset_generation_count(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET generation_count = 0 WHERE user_id = target_user_id;
END;
$$;

-- Auto-set owner to pro_plus on profile creation
CREATE OR REPLACE FUNCTION public.auto_set_owner_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE id = NEW.user_id AND email = 'jane7valentina@gmail.com'
  ) THEN
    NEW.subscription_plan := 'pro_plus';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_owner_plan_on_profile
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_set_owner_plan();
