-- ═══════════════════════════════════════════════════════════════════
-- v17: Add Employee Code for secure salary access
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emp_code TEXT;
