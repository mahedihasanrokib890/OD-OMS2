-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · অর্ধেকদ্বীন HR Management System
-- COMPLETE Database Schema (Supabase / PostgreSQL)
--
-- ► HOW TO USE:
--   1. Open your new Supabase project → SQL Editor → New query
--   2. Paste this ENTIRE file → click RUN
--   3. Done — all tables, policies, triggers, seed data ready
-- ═══════════════════════════════════════════════════════════════════════

-- 1. EMPLOYEE TYPES (dynamic, admin can add new types)
CREATE TABLE IF NOT EXISTS public.employee_types (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,
  name_bn       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.employee_types (code, name_bn, name_en, is_admin, display_order)
VALUES
  ('admin',  'অ্যাডমিন',     'Admin',           true,  0),
  ('type_1', 'কর্মী টাইপ ১', 'Employee Type 1', false, 1),
  ('type_2', 'কর্মী টাইপ ২', 'Employee Type 2', false, 2)
ON CONFLICT (code) DO NOTHING;

-- 2. OFFICE TIMES (per employee type)
CREATE TABLE IF NOT EXISTS public.office_times (
  id                BIGSERIAL PRIMARY KEY,
  employee_type_id  BIGINT UNIQUE REFERENCES public.employee_types(id) ON DELETE CASCADE,
  check_in_time     TIME NOT NULL DEFAULT '10:00',
  check_out_time    TIME NOT NULL DEFAULT '18:00',
  lunch_start_time  TIME NOT NULL DEFAULT '13:30',
  lunch_end_time    TIME NOT NULL DEFAULT '14:30',
  grace_minutes     INT  NOT NULL DEFAULT 15,
  break_minutes     INT  NOT NULL DEFAULT 60,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.office_times (employee_type_id, check_in_time, check_out_time, lunch_start_time, lunch_end_time)
SELECT id, '09:00', '18:00', '13:00', '14:00' FROM public.employee_types WHERE code = 'admin'
ON CONFLICT (employee_type_id) DO NOTHING;

INSERT INTO public.office_times (employee_type_id, check_in_time, check_out_time, lunch_start_time, lunch_end_time)
SELECT id, '10:00', '18:00', '13:30', '14:30' FROM public.employee_types WHERE code = 'type_1'
ON CONFLICT (employee_type_id) DO NOTHING;

INSERT INTO public.office_times (employee_type_id, check_in_time, check_out_time, lunch_start_time, lunch_end_time)
SELECT id, '09:00', '17:00', '13:00', '13:30' FROM public.employee_types WHERE code = 'type_2'
ON CONFLICT (employee_type_id) DO NOTHING;

-- 3. PROFILES (linked 1:1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  email             TEXT UNIQUE NOT NULL,
  phone             TEXT,
  designation       TEXT,
  employee_type_id  BIGINT REFERENCES public.employee_types(id),
  photo_url         TEXT,
  date_of_birth     DATE,
  national_id       TEXT,
  address           TEXT,
  emergency_contact TEXT,
  joined_at         DATE,
  salary            NUMERIC(12, 2),
  bank_account      TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  is_admin          BOOLEAN NOT NULL DEFAULT false,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_type   ON public.profiles(employee_type_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- 4. NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'general',  -- urgent, important, general
  posted_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notices_active ON public.notices(is_active, created_at DESC);

-- 5. NOTICE READS
CREATE TABLE IF NOT EXISTS public.notice_reads (
  notice_id  BIGINT NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id    UUID  NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notice_id, user_id)
);

-- 6. LEAVES
CREATE TABLE IF NOT EXISTS public.leaves (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type      TEXT NOT NULL DEFAULT 'casual',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_days      INT GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES public.profiles(id),
  reviewed_at     TIMESTAMPTZ,
  review_comment  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= start_date),
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);
CREATE INDEX IF NOT EXISTS idx_leaves_user   ON public.leaves(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leaves(status, created_at DESC);

-- 7. ATTENDANCE (drop old + recreate with FK to profiles)
DROP TABLE IF EXISTS public.attendance CASCADE;
CREATE TABLE public.attendance (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  check_in      TIMESTAMPTZ,
  check_out     TIMESTAMPTZ,
  lunch_out     TIMESTAMPTZ,
  lunch_in      TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'present',
  late_minutes  INT DEFAULT 0,
  total_hours   NUMERIC(5,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_att_user_date ON public.attendance(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_att_date      ON public.attendance(date DESC);

-- 8. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.app_settings (key, value) VALUES
  ('company',      '{"name":"অর্ধেকদ্বীন","logo_url":"/logo.svg"}'::jsonb),
  ('leave_policy', '{"annual_days":20,"sick_days":10,"casual_days":7}'::jsonb),
  ('admin_emails', '["admin@ordhekdeen.com","mahedihasanrokib83@gmail.com"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: is current user admin?
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((
    SELECT p.is_admin
    FROM public.profiles p
    WHERE p.id = auth.uid()
    LIMIT 1
  ), false);
$$;

-- ─────────────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE on signup
-- Admin emails (from app_settings.admin_emails) automatically get admin role
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  type_id     BIGINT;
  is_admin_user BOOLEAN := false;
  admin_list  JSONB;
  type_code   TEXT;
BEGIN
  -- Check if email is in admin allow-list
  SELECT value INTO admin_list FROM public.app_settings WHERE key = 'admin_emails';
  IF admin_list IS NOT NULL AND admin_list ? NEW.email THEN
    is_admin_user := true;
  END IF;

  -- Determine employee_type from metadata
  type_code := COALESCE(NEW.raw_user_meta_data->>'employee_type', 'type_1');
  IF is_admin_user THEN type_code := 'admin'; END IF;

  SELECT id INTO type_id FROM public.employee_types WHERE code = type_code LIMIT 1;
  IF type_id IS NULL THEN
    SELECT id INTO type_id FROM public.employee_types WHERE code = 'type_1' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, designation, employee_type_id, is_admin, joined_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'designation',
    type_id,
    is_admin_user,
    CURRENT_DATE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name   = EXCLUDED.full_name,
    phone       = EXCLUDED.phone,
    designation = EXCLUDED.designation,
    is_admin    = EXCLUDED.is_admin OR profiles.is_admin;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for existing auth users (in case any signed up before trigger was created)
INSERT INTO public.profiles (id, email, full_name, employee_type_id, is_admin, joined_at)
SELECT
  u.id, u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  (SELECT id FROM public.employee_types WHERE code = 'type_1' LIMIT 1),
  CASE WHEN u.email IN ('admin@ordhekdeen.com', 'mahedihasanrokib83@gmail.com') THEN true ELSE false END,
  CURRENT_DATE
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  is_admin = EXCLUDED.is_admin OR profiles.is_admin;

-- Update employee_type_id for admin users
UPDATE public.profiles
SET employee_type_id = (SELECT id FROM public.employee_types WHERE code='admin' LIMIT 1)
WHERE is_admin = true;

-- ─────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_times    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_reads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings    ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean re-run)
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT polname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.polname, r.tablename);
  END LOOP;
END $$;

-- profiles
CREATE POLICY "profiles_read_all"     ON public.profiles      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "profiles_self_update"  ON public.profiles      FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_insert" ON public.profiles      FOR INSERT WITH CHECK (public.is_admin() OR id = auth.uid());
CREATE POLICY "profiles_admin_delete" ON public.profiles      FOR DELETE USING (public.is_admin());

-- employee_types: read all, write only admin
CREATE POLICY "etype_read"  ON public.employee_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "etype_write" ON public.employee_types FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- office_times
CREATE POLICY "otime_read"  ON public.office_times   FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "otime_write" ON public.office_times   FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- attendance
CREATE POLICY "att_self_read"   ON public.attendance FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "att_self_insert" ON public.attendance FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "att_self_update" ON public.attendance FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "att_admin_delete" ON public.attendance FOR DELETE USING (public.is_admin());

-- leaves
CREATE POLICY "lv_read"          ON public.leaves    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "lv_self_insert"   ON public.leaves    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "lv_admin_update"  ON public.leaves    FOR UPDATE USING (public.is_admin() OR (user_id = auth.uid() AND status = 'pending'));
CREATE POLICY "lv_admin_delete"  ON public.leaves    FOR DELETE USING (public.is_admin());

-- notices
CREATE POLICY "nt_read"  ON public.notices       FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "nt_write" ON public.notices       FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- notice_reads
CREATE POLICY "nr_self"  ON public.notice_reads  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- app_settings
CREATE POLICY "as_read"  ON public.app_settings  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "as_write" ON public.app_settings  FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- Realtime
-- ─────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notices';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.notices; END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leaves';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.leaves; END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'attendance';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance; END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ Setup Complete!
-- Now go to your app and start using it.
-- ═══════════════════════════════════════════════════════════════════════
