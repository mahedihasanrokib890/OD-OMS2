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
