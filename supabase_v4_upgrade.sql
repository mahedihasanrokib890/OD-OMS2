-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · v4 Upgrade
-- Adds: attendance leave_code (for absence tracking with short codes)
-- Run after v3
-- ═══════════════════════════════════════════════════════════════════════

-- Add leave_code to attendance for short-code absence marking (CL, SL, EL, CoL, M, PH, UL, IL)
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS leave_code TEXT;

-- Make sure status accepts 'leave' as one of values (already does)
-- Ensure CHECK constraint is loose enough
DO $$ BEGIN
  ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Add EL (Earn Leave) to leave_policies if not exists
INSERT INTO public.leave_policies (code, name_bn, name_en, yearly_limit, per_request_max, is_paid, description, display_order) VALUES
  ('EL',  'অর্জিত ছুটি',       'Earn Leave',          NULL, NULL, true,  'Earned leave', 9)
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ v4 Upgrade Complete
-- ═══════════════════════════════════════════════════════════════════════
