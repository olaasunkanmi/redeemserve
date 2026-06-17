
-- Geo coords for live map
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS lng NUMERIC(10, 7);

-- Backfill rough Redemption City coords from pos_x/pos_y around (6.8030, 3.2130)
UPDATE public.vendors
SET
  lat = 6.8030 + ((pos_y - 50) / 100.0) * 0.025,
  lng = 3.2130 + ((pos_x - 50) / 100.0) * 0.025
WHERE lat IS NULL;

-- Referral code on profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_naira INTEGER NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referred_user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own referrals" ON public.referrals;
CREATE POLICY "Users view their own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users insert referrals as themselves" ON public.referrals;
CREATE POLICY "Users insert referrals as themselves" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);

-- Function: get or generate a referral code for the current user
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT referral_code INTO v_code FROM public.profiles WHERE id = v_uid;
  IF v_code IS NOT NULL THEN RETURN v_code; END IF;
  LOOP
    v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_code);
  END LOOP;
  UPDATE public.profiles SET referral_code = v_code WHERE id = v_uid;
  RETURN v_code;
END $$;

REVOKE EXECUTE ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;

-- Function: redeem a referral code (called once when signing up)
CREATE OR REPLACE FUNCTION public.redeem_referral_code(_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_referrer UUID;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  -- Already referred?
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND referred_by IS NOT NULL) THEN
    RETURN FALSE;
  END IF;
  SELECT id INTO v_referrer FROM public.profiles WHERE referral_code = upper(_code) AND id <> v_uid;
  IF v_referrer IS NULL THEN RETURN FALSE; END IF;
  UPDATE public.profiles SET referred_by = v_referrer WHERE id = v_uid;
  INSERT INTO public.referrals (referrer_id, referred_user_id, status)
  VALUES (v_referrer, v_uid, 'pending')
  ON CONFLICT (referred_user_id) DO NOTHING;
  RETURN TRUE;
END $$;

REVOKE EXECUTE ON FUNCTION public.redeem_referral_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_referral_code(TEXT) TO authenticated;
