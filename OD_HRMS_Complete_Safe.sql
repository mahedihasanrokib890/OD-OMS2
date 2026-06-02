-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · All In One SQL (v10 + v11 + v12)
-- Monthly Activity, Messages (Chat), and Handbook Storage
-- This file is SAFE to run multiple times without errors.
--
-- ► Supabase SQL Editor → New query → পেস্ট করে RUN চাপুন
-- ═══════════════════════════════════════════════════════════════════════

-- ==========================================
-- 1. MONTHLY ACTIVITY (v10)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.monthly_activity (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,
  emp_code        TEXT,
  designation     TEXT,
  month           TEXT NOT NULL,
  month_label     TEXT,
  present_days    INT     DEFAULT 0,
  late_count      INT     DEFAULT 0,
  late_hours      NUMERIC(8,2) DEFAULT 0,
  worked_hours    NUMERIC(8,2) DEFAULT 0,
  regular_days    INT     DEFAULT 0,
  regular_hours   NUMERIC(8,2) DEFAULT 0,
  cl_days         NUMERIC(6,1) DEFAULT 0,
  sl_days         NUMERIC(6,1) DEFAULT 0,
  el_days         NUMERIC(6,1) DEFAULT 0,
  col_days        NUMERIC(6,1) DEFAULT 0,
  ml_days         NUMERIC(6,1) DEFAULT 0,
  ph_days         NUMERIC(6,1) DEFAULT 0,
  ul_days         NUMERIC(6,1) DEFAULT 0,
  il_days         NUMERIC(6,1) DEFAULT 0,
  total_leave     NUMERIC(6,1) DEFAULT 0,
  activity_pct    NUMERIC(5,2) DEFAULT 0,
  attendance_pct  NUMERIC(5,2) DEFAULT 0,
  sort_order      INT DEFAULT 0,
  source          TEXT DEFAULT 'sheet',
  imported_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_name, month)
);

CREATE INDEX IF NOT EXISTS idx_ma_month ON public.monthly_activity(month);
CREATE INDEX IF NOT EXISTS idx_ma_user  ON public.monthly_activity(user_id);

ALTER TABLE public.monthly_activity ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE public.monthly_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ma_read"  ON public.monthly_activity;
DROP POLICY IF EXISTS "ma_write" ON public.monthly_activity;

CREATE POLICY "ma_read"  ON public.monthly_activity FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ma_write" ON public.monthly_activity FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==========================================
-- 2. MESSAGES SYSTEM (v11)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.messages (
  id            BIGSERIAL PRIMARY KEY,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_emoji      BOOLEAN NOT NULL DEFAULT false,
  deleted_for   UUID[] NOT NULL DEFAULT '{}',
  deleted_all   BOOLEAN NOT NULL DEFAULT false,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender   ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_pair     ON public.messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_read" ON public.messages;
DROP POLICY IF EXISTS "msg_insert" ON public.messages;
DROP POLICY IF EXISTS "msg_update" ON public.messages;
DROP POLICY IF EXISTS "msg_delete" ON public.messages;

CREATE POLICY "msg_read" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "msg_insert" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "msg_update" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "msg_delete" ON public.messages
  FOR DELETE USING (public.is_admin());

DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
  IF NOT FOUND THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ==========================================
-- 3. EMPLOYEE HANDBOOK STORAGE (v12)
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Document Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update Delete" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Delete" ON storage.objects;

CREATE POLICY "Public Document Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Auth Users Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Update Delete"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ All setup complete! (Monthly Activity, Messages, Handbook Storage ready)
-- ═══════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- v14: Bonus settings for Employees based on Work Hours and Attendance
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.bonus_settings (
  id INT PRIMARY KEY DEFAULT 1,
  bonus_per_hour NUMERIC(8,2) DEFAULT 0,
  bonus_attendance_pct NUMERIC(5,2) DEFAULT 100,
  bonus_attendance_amount NUMERIC(8,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT bonus_settings_single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.bonus_settings (id, bonus_per_hour, bonus_attendance_pct, bonus_attendance_amount) 
VALUES (1, 0, 100, 0)
ON CONFLICT (id) DO NOTHING;

-- Policies
ALTER TABLE public.bonus_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bonus_read" ON public.bonus_settings;
DROP POLICY IF EXISTS "bonus_write" ON public.bonus_settings;

CREATE POLICY "bonus_read" ON public.bonus_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "bonus_write" ON public.bonus_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$ BEGIN
  RAISE NOTICE '✅ v14 applied — bonus_settings table ready.';
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- v15: Add working days to bonus settings
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.bonus_settings ADD COLUMN IF NOT EXISTS monthly_working_days INT DEFAULT 26;

DO $$ BEGIN
  RAISE NOTICE '✅ v15 applied — monthly_working_days added to bonus_settings.';
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- v16: Advanced Bonus Engine Settings
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.bonus_settings 
  ADD COLUMN IF NOT EXISTS rule_base_amount NUMERIC(8,2) DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS rule_gap_1_amount NUMERIC(8,2) DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS rule_gap_2_amount NUMERIC(8,2) DEFAULT 500,
  ADD COLUMN IF NOT EXISTS rule_gap_3_amount NUMERIC(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rule_min_activity NUMERIC(5,2) DEFAULT 98,
  ADD COLUMN IF NOT EXISTS rule_max_late_days INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS rule_max_late_hours NUMERIC(5,2) DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS rule_exempt_leaves TEXT DEFAULT 'EL,CL';

DO $$ BEGIN
  RAISE NOTICE '✅ v16 applied — Advanced bonus rules added to bonus_settings.';
END $$;


-- ═══════════════════════════════════════════════════════════════════
-- v17: Add Employee Code for secure salary access
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emp_code TEXT;


-- ═══════════════════════════════════════════════════════════════════
-- v18: Schema Cache Fixes & Documents Bucket setup
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure department column exists in profiles (Fix for schema cache issue)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Create documents bucket for Handbook PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Policies for Documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "documents_read" ON storage.objects;
  DROP POLICY IF EXISTS "documents_upload" ON storage.objects;
  DROP POLICY IF EXISTS "documents_update" ON storage.objects;
  DROP POLICY IF EXISTS "documents_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "documents_read"   ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "documents_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND (auth.role() = 'authenticated'));
CREATE POLICY "documents_update" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND (auth.role() = 'authenticated'));
CREATE POLICY "documents_delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND (auth.role() = 'authenticated'));

-- 3. Force Supabase PostgREST schema cache to reload
NOTIFY pgrst, 'reload schema';


-- ═══════════════════════════════════════════════════════════════════
-- v19: Final Schema Sync (Fixes Missing Columns from older updates)
-- ═══════════════════════════════════════════════════════════════════

-- Ensure all columns from v2 and v17 are present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'employee';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position_rank INT NOT NULL DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emp_code TEXT;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';


-- ==========================================
-- 1. ONBOARDING SYSTEM (v20)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.onboarding_tasks (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_name       TEXT NOT NULL,
  description     TEXT,
  is_completed    BOOLEAN DEFAULT false,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_user ON public.onboarding_tasks(user_id);

ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "onboarding_read" ON public.onboarding_tasks;
DROP POLICY IF EXISTS "onboarding_write" ON public.onboarding_tasks;

CREATE POLICY "onboarding_read" ON public.onboarding_tasks 
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "onboarding_write" ON public.onboarding_tasks 
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- ==========================================
-- 2. PAYROLL & SALARY STRUCTURE (v20)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.salary_structures (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  basic_salary        NUMERIC(10,2) DEFAULT 0,
  house_rent          NUMERIC(10,2) DEFAULT 0,
  medical_allowance   NUMERIC(10,2) DEFAULT 0,
  transport_allowance NUMERIC(10,2) DEFAULT 0,
  provident_fund      NUMERIC(10,2) DEFAULT 0,
  tax_deduction       NUMERIC(10,2) DEFAULT 0,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salary_read" ON public.salary_structures;
DROP POLICY IF EXISTS "salary_write" ON public.salary_structures;

CREATE POLICY "salary_read" ON public.salary_structures 
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "salary_write" ON public.salary_structures 
  FOR ALL USING (public.is_admin());

-- ==========================================
-- 3. MONTHLY PAYROLL RECORDS (v20)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.payroll_records (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month               TEXT NOT NULL, -- Format: YYYY-MM
  base_salary         NUMERIC(10,2) DEFAULT 0,
  total_allowance     NUMERIC(10,2) DEFAULT 0,
  total_deduction     NUMERIC(10,2) DEFAULT 0,
  net_salary          NUMERIC(10,2) DEFAULT 0,
  status              TEXT DEFAULT 'Pending', -- Pending, Paid
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_payroll_month ON public.payroll_records(month);

ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payroll_record_read" ON public.payroll_records;
DROP POLICY IF EXISTS "payroll_record_write" ON public.payroll_records;

CREATE POLICY "payroll_record_read" ON public.payroll_records 
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "payroll_record_write" ON public.payroll_records 
  FOR ALL USING (public.is_admin());


-- ==========================================
-- OD-HRMS Phase 2 (ATS, Performance, Expense, Geolocation)
-- ==========================================

-- 1. ADD GEOLOCATION TO ATTENDANCE
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS check_in_loc TEXT;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS check_out_loc TEXT;

-- ==========================================
-- 2. APPLICANT TRACKING SYSTEM (ATS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.job_postings (
  id              BIGSERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  department      TEXT,
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id              BIGSERIAL PRIMARY KEY,
  job_id          BIGINT REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_name  TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  resume_url      TEXT,
  status          TEXT DEFAULT 'Pending', -- Pending, Reviewed, Interview, Hired, Rejected
  applied_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. PERFORMANCE MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS public.performance_goals (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_title      TEXT NOT NULL,
  description     TEXT,
  target_date     DATE,
  status          TEXT DEFAULT 'In Progress', -- In Progress, Achieved, Missed
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id     UUID REFERENCES public.profiles(id),
  review_month    TEXT, -- YYYY-MM
  rating          INT CHECK (rating >= 1 AND rating <= 5),
  feedback        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. EXPENSE MANAGEMENT
-- ==========================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2) NOT NULL,
  category        TEXT, -- Travel, Food, Supplies, Other
  description     TEXT,
  receipt_url     TEXT,
  status          TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
  approved_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Set Policies (Simplified for demo, admin can read/write all, users can read/write their own)
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read job postings (maybe public later)
DROP POLICY IF EXISTS "Public Read Jobs" ON public.job_postings;
CREATE POLICY "Public Read Jobs" ON public.job_postings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Write Jobs" ON public.job_postings;
CREATE POLICY "Admin Write Jobs" ON public.job_postings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Read Apps" ON public.job_applications;
CREATE POLICY "Admin Read Apps" ON public.job_applications FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Public Write Apps" ON public.job_applications;
CREATE POLICY "Public Write Apps" ON public.job_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin Write Apps" ON public.job_applications;
CREATE POLICY "Admin Write Apps" ON public.job_applications FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "User Read Goals" ON public.performance_goals;
CREATE POLICY "User Read Goals" ON public.performance_goals FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Admin Write Goals" ON public.performance_goals;
CREATE POLICY "Admin Write Goals" ON public.performance_goals FOR ALL USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "User Read Reviews" ON public.performance_reviews;
CREATE POLICY "User Read Reviews" ON public.performance_reviews FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Admin Write Reviews" ON public.performance_reviews;
CREATE POLICY "Admin Write Reviews" ON public.performance_reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "User Read Expenses" ON public.expenses;
CREATE POLICY "User Read Expenses" ON public.expenses FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "User Write Expenses" ON public.expenses;
CREATE POLICY "User Write Expenses" ON public.expenses FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admin Update Expenses" ON public.expenses;
CREATE POLICY "Admin Update Expenses" ON public.expenses FOR UPDATE USING (public.is_admin());


-- V22: Add extra location tracking columns to attendance table
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS lunch_out_loc text,
ADD COLUMN IF NOT EXISTS lunch_in_loc text,
ADD COLUMN IF NOT EXISTS personal_out_loc text,
ADD COLUMN IF NOT EXISTS personal_in_loc text;


