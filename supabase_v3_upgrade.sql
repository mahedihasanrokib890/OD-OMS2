-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · v3 Upgrade
-- Adds: personal_break columns to attendance, leave types & policies
-- Run this AFTER v2 upgrade
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Personal break columns on attendance
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS personal_out TIMESTAMPTZ;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS personal_in  TIMESTAMPTZ;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS personal_minutes INT DEFAULT 0;

-- 2. Leave Type Policies table — defines yearly limits per leave type
CREATE TABLE IF NOT EXISTS public.leave_policies (
  code           TEXT PRIMARY KEY,         -- SL, CL, ML, CoL, PH, UL, IL, AL
  name_bn        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  yearly_limit   INT,                       -- NULL = unlimited
  per_request_max INT,                      -- max days per single request
  is_paid        BOOLEAN NOT NULL DEFAULT true,
  description    TEXT,
  display_order  INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed leave policies (based on user's requirements)
INSERT INTO public.leave_policies (code, name_bn, name_en, yearly_limit, per_request_max, is_paid, description, display_order) VALUES
  ('SL',  'অসুস্থতা ছুটি',     'Sick Leave',          14,   NULL, true,  'Annual sick leave', 1),
  ('CL',  'নৈমিত্তিক ছুটি',    'Casual Leave',        10,   NULL, true,  'Annual casual leave', 2),
  ('ML',  'বিবাহ ছুটি',        'Marriage Leave',      10,   10,   true,  'Once per career, up to 10 days', 3),
  ('CoL', 'সমবেদনা ছুটি',      'Compassionate Leave', NULL, 3,    true,  'Max 3 days per request, family bereavement', 4),
  ('AL',  'বার্ষিক ছুটি',      'Annual Leave',        20,   NULL, true,  'Yearly vacation entitlement', 5),
  ('PH',  'সরকারি ছুটি',       'Public Holiday',      NULL, NULL, true,  'Govt holidays (auto-applied)', 6),
  ('UL',  'অননুমোদিত ছুটি',   'Unnotice Leave',      NULL, NULL, false, 'Without prior notice', 7),
  ('IL',  'দায়িত্বহীন ছুটি',  'Irresponsible Leave', NULL, NULL, false, 'Disciplinary record', 8)
ON CONFLICT (code) DO UPDATE SET
  name_bn = EXCLUDED.name_bn,
  name_en = EXCLUDED.name_en,
  yearly_limit = EXCLUDED.yearly_limit,
  per_request_max = EXCLUDED.per_request_max,
  is_paid = EXCLUDED.is_paid,
  description = EXCLUDED.description;

ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lp_read"  ON public.leave_policies;
DROP POLICY IF EXISTS "lp_write" ON public.leave_policies;
CREATE POLICY "lp_read"  ON public.leave_policies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lp_write" ON public.leave_policies FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Update leaves table — change from leave_type to leave_code (tied to policies)
-- We keep leave_type column for backward compatibility; add leave_code
ALTER TABLE public.leaves ADD COLUMN IF NOT EXISTS leave_code TEXT REFERENCES public.leave_policies(code);

-- Migrate existing leave_type values to codes
UPDATE public.leaves SET leave_code = CASE
  WHEN leave_type = 'casual'    THEN 'CL'
  WHEN leave_type = 'sick'      THEN 'SL'
  WHEN leave_type = 'annual'    THEN 'AL'
  WHEN leave_type = 'unpaid'    THEN 'UL'
  WHEN leave_type = 'maternity' THEN 'CoL'  -- closest match; admin can adjust
  WHEN leave_type = 'hajj'      THEN 'AL'
  ELSE 'CL'
END
WHERE leave_code IS NULL;

-- 4. Helper function: how many days of a leave type used by a user this year
CREATE OR REPLACE FUNCTION public.get_leave_used(p_user UUID, p_code TEXT, p_year INT)
RETURNS INT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(SUM(total_days), 0)::INT
  FROM public.leaves
  WHERE user_id = p_user
    AND leave_code = p_code
    AND status = 'approved'
    AND EXTRACT(YEAR FROM start_date) = p_year;
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ v3 Upgrade Complete
-- ═══════════════════════════════════════════════════════════════════════
