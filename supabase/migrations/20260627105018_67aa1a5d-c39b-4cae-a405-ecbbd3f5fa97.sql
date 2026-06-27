
-- 1. Extend orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY['pending','accepted','preparing','ready','out_for_delivery','delivered','cancelled']));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_type text NOT NULL DEFAULT 'pickup' CHECK (fulfillment_type IN ('pickup','delivery')),
  ADD COLUMN IF NOT EXISTS delivery_address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_landmark text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS delivery_fee_naira integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS courier_phone text,
  ADD COLUMN IF NOT EXISTS tracking_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS preparing_at timestamptz,
  ADD COLUMN IF NOT EXISTS ready_at timestamptz,
  ADD COLUMN IF NOT EXISTS out_for_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS estimated_ready_minutes integer;

-- 2. Tracking code generator + status timestamps
CREATE OR REPLACE FUNCTION public.orders_set_tracking_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_code text;
BEGIN
  IF NEW.tracking_code IS NULL THEN
    LOOP
      v_code := 'RS-' || upper(substring(replace(gen_random_uuid()::text,'-','') for 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE tracking_code = v_code);
    END LOOP;
    NEW.tracking_code := v_code;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_orders_tracking_code ON public.orders;
CREATE TRIGGER trg_orders_tracking_code BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_set_tracking_code();

-- Backfill existing rows
UPDATE public.orders SET tracking_code = 'RS-' || upper(substring(replace(gen_random_uuid()::text,'-','') for 8))
WHERE tracking_code IS NULL;

CREATE OR REPLACE FUNCTION public.orders_stamp_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'accepted'         AND NEW.accepted_at IS NULL          THEN NEW.accepted_at := now(); END IF;
    IF NEW.status = 'preparing'        AND NEW.preparing_at IS NULL         THEN NEW.preparing_at := now(); END IF;
    IF NEW.status = 'ready'            AND NEW.ready_at IS NULL             THEN NEW.ready_at := now(); END IF;
    IF NEW.status = 'out_for_delivery' AND NEW.out_for_delivery_at IS NULL  THEN NEW.out_for_delivery_at := now(); END IF;
    IF NEW.status = 'delivered'        AND NEW.delivered_at IS NULL         THEN NEW.delivered_at := now(); END IF;
    IF NEW.status = 'cancelled'        AND NEW.cancelled_at IS NULL         THEN NEW.cancelled_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_orders_stamp_status ON public.orders;
CREATE TRIGGER trg_orders_stamp_status BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_stamp_status();

-- 3. Tracking events timeline
CREATE TABLE IF NOT EXISTS public.order_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.order_tracking_events TO authenticated;
GRANT ALL ON public.order_tracking_events TO service_role;

ALTER TABLE public.order_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracking_buyer_read" ON public.order_tracking_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()));

CREATE POLICY "tracking_vendor_read" ON public.order_tracking_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o JOIN public.vendors v ON v.id = o.vendor_id
               WHERE o.id = order_id AND v.owner_id = auth.uid()));

CREATE POLICY "tracking_admin_read" ON public.order_tracking_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_tracking_order ON public.order_tracking_events(order_id, created_at);

-- Auto-log on insert / status change
CREATE OR REPLACE FUNCTION public.orders_log_tracking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_tracking_events(order_id, status, note, actor_id, actor_role)
    VALUES (NEW.id, NEW.status, 'Order placed', NEW.buyer_id, 'buyer');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_tracking_events(order_id, status, note, actor_id, actor_role)
    VALUES (NEW.id, NEW.status,
            CASE NEW.status
              WHEN 'accepted' THEN 'Vendor accepted the order'
              WHEN 'preparing' THEN 'Vendor is preparing your order'
              WHEN 'ready' THEN CASE NEW.fulfillment_type WHEN 'pickup' THEN 'Ready for pickup' ELSE 'Ready — awaiting courier' END
              WHEN 'out_for_delivery' THEN 'Out for delivery'
              WHEN 'delivered' THEN CASE NEW.fulfillment_type WHEN 'pickup' THEN 'Picked up by buyer' ELSE 'Delivered' END
              WHEN 'cancelled' THEN 'Order cancelled'
              ELSE NEW.status
            END,
            auth.uid(), 'system');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_orders_log_tracking_ins ON public.orders;
CREATE TRIGGER trg_orders_log_tracking_ins AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_log_tracking();

DROP TRIGGER IF EXISTS trg_orders_log_tracking_upd ON public.orders;
CREATE TRIGGER trg_orders_log_tracking_upd AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_log_tracking();

ALTER PUBLICATION supabase_realtime ADD TABLE public.order_tracking_events;

-- 4. Public tracking lookup by code (no auth required, safe columns only)
CREATE OR REPLACE FUNCTION public.track_order(_code text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v jsonb;
BEGIN
  SELECT jsonb_build_object(
    'tracking_code', o.tracking_code,
    'status', o.status,
    'fulfillment_type', o.fulfillment_type,
    'created_at', o.created_at,
    'accepted_at', o.accepted_at,
    'preparing_at', o.preparing_at,
    'ready_at', o.ready_at,
    'out_for_delivery_at', o.out_for_delivery_at,
    'delivered_at', o.delivered_at,
    'cancelled_at', o.cancelled_at,
    'pickup_zone', o.pickup_zone,
    'delivery_address', o.delivery_address,
    'delivery_landmark', o.delivery_landmark,
    'courier_name', o.courier_name,
    'courier_phone', o.courier_phone,
    'total_naira', o.total_naira,
    'vendor', jsonb_build_object('business_name', v.business_name, 'zone', v.zone, 'phone', v.phone),
    'events', COALESCE((SELECT jsonb_agg(jsonb_build_object('status', e.status, 'note', e.note, 'created_at', e.created_at) ORDER BY e.created_at)
                         FROM public.order_tracking_events e WHERE e.order_id = o.id), '[]'::jsonb)
  ) INTO v
  FROM public.orders o JOIN public.vendors v ON v.id = o.vendor_id
  WHERE o.tracking_code = upper(_code);
  RETURN v;
END $$;

GRANT EXECUTE ON FUNCTION public.track_order(text) TO anon, authenticated;
