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
