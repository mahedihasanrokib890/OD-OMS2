-- ═══════════════════════════════════════════════════════════════════
-- v15: Add working days to bonus settings
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.bonus_settings ADD COLUMN IF NOT EXISTS monthly_working_days INT DEFAULT 26;

DO $$ BEGIN
  RAISE NOTICE '✅ v15 applied — monthly_working_days added to bonus_settings.';
END $$;
