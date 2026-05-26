-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · v2 Upgrade
-- Run this AFTER supabase_setup.sql to add: roles, departments, photo storage
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Add role, department, position to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'employee';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_rank INT NOT NULL DEFAULT 5;

-- Update role for existing admins
UPDATE public.profiles SET role = 'admin' WHERE is_admin = true;

-- 2. Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id          BIGSERIAL PRIMARY KEY,
  name_bn     TEXT NOT NULL,
  name_en     TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.departments (name_bn, name_en) VALUES
  ('প্রশাসন', 'Administration'),
  ('আইটি', 'Information Technology'),
  ('হিসাব', 'Accounts'),
  ('মার্কেটিং', 'Marketing'),
  ('কাস্টমার কেয়ার', 'Customer Care')
ON CONFLICT DO NOTHING;

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "dept_read"  ON public.departments;
  DROP POLICY IF EXISTS "dept_write" ON public.departments;
  CREATE POLICY "dept_read"  ON public.departments FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "dept_write" ON public.departments FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());
END $$;

-- 3. Update is_admin() to also count editors as elevated (for some operations)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((
    SELECT (p.role = 'admin' OR p.is_admin)
    FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1
  ), false);
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((
    SELECT (p.role IN ('admin','editor') OR p.is_admin)
    FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1
  ), false);
$$;

-- 4. Storage bucket for avatars (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: anyone can read; authenticated users upload to their own folder
DO $$ BEGIN
  DROP POLICY IF EXISTS "avatars_read"   ON storage.objects;
  DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
  DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "avatars_read"   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 5. Update handle_new_user trigger to set default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  type_id BIGINT;
  is_admin_user BOOLEAN := false;
  user_role TEXT := 'employee';
  admin_list JSONB;
  type_code TEXT;
BEGIN
  SELECT value INTO admin_list FROM public.app_settings WHERE key = 'admin_emails';
  IF admin_list IS NOT NULL AND admin_list ? NEW.email THEN
    is_admin_user := true;
    user_role := 'admin';
  END IF;
  type_code := COALESCE(NEW.raw_user_meta_data->>'employee_type', 'type_1');
  IF is_admin_user THEN type_code := 'admin'; END IF;
  SELECT id INTO type_id FROM public.employee_types WHERE code = type_code LIMIT 1;
  IF type_id IS NULL THEN SELECT id INTO type_id FROM public.employee_types WHERE code = 'type_1' LIMIT 1; END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, designation, employee_type_id, is_admin, role, joined_at)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'designation',
    type_id, is_admin_user, user_role, CURRENT_DATE)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    is_admin  = EXCLUDED.is_admin OR profiles.is_admin,
    role      = CASE WHEN EXCLUDED.is_admin THEN 'admin' ELSE profiles.role END;
  RETURN NEW;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ v2 Upgrade Complete
-- ═══════════════════════════════════════════════════════════════════════
