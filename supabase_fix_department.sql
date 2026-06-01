-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · Department Column Fix
-- এই SQL টি Supabase Dashboard → SQL Editor-এ চালান
-- এরপর ইনবক্সে department ও দেখাবে
-- ═══════════════════════════════════════════════════════════════════════

-- profiles টেবিলে department কলাম যোগ করুন (যদি না থাকে)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- position_title ও position_rank ও যোগ করুন (যদি না থাকে)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_rank INT NOT NULL DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'employee';

-- departments টেবিল তৈরি করুন (যদি না থাকে)
CREATE TABLE IF NOT EXISTS public.departments (
  id          BIGSERIAL PRIMARY KEY,
  name_bn     TEXT NOT NULL,
  name_en     TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- কিছু ডিফল্ট ডিপার্টমেন্ট যোগ করুন
INSERT INTO public.departments (name_bn, name_en) VALUES
  ('প্রশাসন', 'Administration'),
  ('আইটি', 'Information Technology'),
  ('হিসাব', 'Accounts'),
  ('মার্কেটিং', 'Marketing'),
  ('কাস্টমার কেয়ার', 'Customer Care')
ON CONFLICT DO NOTHING;

-- RLS চালু করুন
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "dept_read"  ON public.departments;
  DROP POLICY IF EXISTS "dept_write" ON public.departments;
  CREATE POLICY "dept_read"  ON public.departments FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "dept_write" ON public.departments FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ✅ সম্পন্ন — এখন কর্মীদের প্রোফাইলে department সেট করতে পারবেন
