
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','vendor','attendee');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto-create profile + assign attendee role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'attendee')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vendors
CREATE TYPE public.vendor_status AS ENUM ('live','low-stock','sold-out','closed');

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  zone TEXT NOT NULL CHECK (zone IN ('A','B','C','D')),
  location TEXT NOT NULL DEFAULT '',
  capacity INT NOT NULL DEFAULT 0,
  price_range TEXT NOT NULL DEFAULT '',
  popular_items TEXT[] NOT NULL DEFAULT '{}',
  phone TEXT,
  whatsapp TEXT,
  opens_at TEXT NOT NULL DEFAULT '6:00 AM',
  status public.vendor_status NOT NULL DEFAULT 'live',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  expected_customers INT NOT NULL DEFAULT 0,
  demand TEXT NOT NULL DEFAULT 'Medium',
  pos_x INT NOT NULL DEFAULT 50,
  pos_y INT NOT NULL DEFAULT 50,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_public_read" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "vendors_owner_insert" ON public.vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vendors_owner_update" ON public.vendors FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "vendors_owner_delete" ON public.vendors FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Grant 'vendor' role to user when they create their first vendor
CREATE OR REPLACE FUNCTION public.grant_vendor_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.owner_id, 'vendor')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_vendor_created
  AFTER INSERT ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.grant_vendor_role();

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER vendors_set_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed demo vendors (owner_id NULL => not editable, but visible in directory)
INSERT INTO public.vendors (business_name, category, description, zone, location, capacity, price_range, popular_items, opens_at, status, rating, expected_customers, demand, pos_x, pos_y, verified) VALUES
('Mama Ngozi''s Jollof Kitchen','Food & Drinks','Family-recipe jollof rice, fried plantain, and grilled chicken served hot.','A','Beside Block 4, Main Auditorium',500,'₦1,500 – ₦3,500',ARRAY['Jollof Rice','Plantain','Grilled Chicken'],'6:00 AM','live',4.8,1820,'High',38,52,true),
('ClearWater Sachet & Bottled','Food & Drinks','Cold sachet water, bottled water and soft drinks. Bulk packs available.','B','North Gate Entrance',4200,'₦100 – ₦500',ARRAY['Sachet Water','Bottled Water','Coke 50cl'],'5:00 AM','low-stock',4.6,4200,'High',62,22,true),
('Brother Tunde Tricycle Service','Transport','Keke rides between Family Camp, South Parking and Main Auditorium.','D','South Parking Loop',200,'₦300 – ₦800 / trip',ARRAY['Family Camp ➜ Auditorium','Group ride (4)'],'4:30 AM','live',4.7,960,'High',28,78,true),
('Grace Bookstore & Bibles','Goods','Bibles, RCCG study materials, hymn books, and convention souvenirs.','A','Convention Pavilion Walkway',300,'₦500 – ₦12,000',ARRAY['Study Bible','Convention Tote','Hymn Book'],'7:00 AM','live',4.9,540,'Medium',48,44,true),
('QuickFix Phone Charging','Tech & Phones','Phone charging, USB cables, power banks, and basic repairs.','C','Family Camp Square',150,'₦200 – ₦4,500',ARRAY['Phone Charge (1hr)','Power Bank Rental','USB-C cable'],'6:30 AM','live',4.5,620,'Medium',72,62,true),
('Redeemer First-Aid Point','Medical','Pain relief, malaria tests, ORS, plasters, and basic medical supplies.','C','Behind Hospital Annex',999,'₦100 – ₦2,500',ARRAY['Paracetamol','ORS Sachets','Plasters'],'24 hours','live',5.0,410,'Medium',80,50,true),
('Sister Bisi''s Pap & Akara','Food & Drinks','Hot pap, akara, moi-moi — perfect for early-morning service attendees.','B','Zone B Food Row',400,'₦500 – ₦1,500',ARRAY['Pap & Akara','Moi-moi','Bread & Tea'],'4:30 AM','sold-out',4.7,1340,'High',58,30,true),
('GoBus Shuttle Co.','Transport','Mini-bus shuttles to Lagos, Ibadan & Mowe after service ends.','D','South Parking Bay 3',2100,'₦1,500 – ₦4,500',ARRAY['Lagos Mainland','Ibadan','Mowe / Ofada'],'8:00 PM','live',4.4,2100,'High',22,86,true),
('Mama Tobi Snacks & Biscuits','Goods','Sweets, biscuits, gum, tissues — all the small things you forgot.','C','Family Camp Walkway',280,'₦100 – ₦1,000',ARRAY['Biscuits Pack','Sweet Mix','Tissue Roll'],'6:00 AM','live',4.3,280,'Low',68,70,true),
('GlowSound Audio Repair','Services','On-site repair for earphones, chargers, and small electronics.','A','Tech Row, Zone A',140,'₦500 – ₦3,000',ARRAY['Earphone Repair','Charger Fix'],'9:00 AM','live',4.6,140,'Low',42,60,true);
