-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · v5 Upgrade
-- Adds: password_reset_requests table (for admin-handled password recovery)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id           BIGSERIAL PRIMARY KEY,
  email        TEXT NOT NULL,
  reason       TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | resolved | rejected
  resolved_by  UUID REFERENCES public.profiles(id),
  resolved_at  TIMESTAMPTZ,
  admin_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('pending','resolved','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_prr_status ON public.password_reset_requests(status, created_at DESC);

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (so anonymous users can request reset)
DROP POLICY IF EXISTS "prr_insert" ON public.password_reset_requests;
CREATE POLICY "prr_insert" ON public.password_reset_requests
  FOR INSERT WITH CHECK (true);

-- Only admin can SELECT/UPDATE/DELETE
DROP POLICY IF EXISTS "prr_admin" ON public.password_reset_requests;
CREATE POLICY "prr_admin" ON public.password_reset_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Realtime
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'password_reset_requests';
  IF NOT FOUND THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.password_reset_requests; END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ v5 Upgrade Complete
-- ═══════════════════════════════════════════════════════════════════════
