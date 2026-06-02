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
CREATE POLICY "Public Read Jobs" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Admin Write Jobs" ON public.job_postings FOR ALL USING (public.is_admin());

CREATE POLICY "Admin Read Apps" ON public.job_applications FOR SELECT USING (public.is_admin());
CREATE POLICY "Public Write Apps" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Write Apps" ON public.job_applications FOR UPDATE USING (public.is_admin());

CREATE POLICY "User Read Goals" ON public.performance_goals FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin Write Goals" ON public.performance_goals FOR ALL USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "User Read Reviews" ON public.performance_reviews FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admin Write Reviews" ON public.performance_reviews FOR ALL USING (public.is_admin());

CREATE POLICY "User Read Expenses" ON public.expenses FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "User Write Expenses" ON public.expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin Update Expenses" ON public.expenses FOR UPDATE USING (public.is_admin());
