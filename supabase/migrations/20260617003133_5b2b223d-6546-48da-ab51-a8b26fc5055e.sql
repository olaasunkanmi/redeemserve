
-- Vendor plan + featured promotion
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','premium')),
  ADD COLUMN IF NOT EXISTS plan_renews_at timestamptz,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Order financial breakdown
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_naira numeric,
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 0.09,
  ADD COLUMN IF NOT EXISTS commission_naira numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_fee_naira numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vendor_payout_naira numeric NOT NULL DEFAULT 0;

-- Trigger: compute commission based on vendor plan
CREATE OR REPLACE FUNCTION public.compute_order_fees()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan text;
  v_rate numeric;
BEGIN
  SELECT plan INTO v_plan FROM public.vendors WHERE id = NEW.vendor_id;
  v_rate := CASE COALESCE(v_plan,'free')
              WHEN 'premium' THEN 0.03
              WHEN 'pro' THEN 0.06
              ELSE 0.09
            END;
  NEW.subtotal_naira := COALESCE(NEW.subtotal_naira, NEW.total_naira);
  NEW.commission_rate := v_rate;
  NEW.commission_naira := ROUND(NEW.subtotal_naira * v_rate);
  NEW.vendor_payout_naira := NEW.subtotal_naira - NEW.commission_naira;
  NEW.total_naira := NEW.subtotal_naira + COALESCE(NEW.service_fee_naira,0);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_compute_order_fees ON public.orders;
CREATE TRIGGER trg_compute_order_fees
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.compute_order_fees();
