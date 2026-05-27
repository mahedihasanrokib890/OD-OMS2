-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · v6 Upgrade
-- Adds: code column to password_reset_requests for self-service reset
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE public.password_reset_requests ADD COLUMN IF NOT EXISTS code TEXT;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ v6 Upgrade Complete
-- ═══════════════════════════════════════════════════════════════════════
