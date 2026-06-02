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
