-- ═══════════════════════════════════════════════════════════════════
-- v8: Soft-hide for employee-owned leaves AND notice subscriptions
-- Employees can "trash" their own leave/notice from their view
-- but admin still sees the original record.
-- Admin's delete is still a real DB delete (handled by existing policies).
-- ═══════════════════════════════════════════════════════════════════
-- Run once in Supabase SQL Editor.

-- 1. Soft-hide column on leaves
ALTER TABLE public.leaves
  ADD COLUMN IF NOT EXISTS hidden_for_user BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Replace lv_delete policy: only admin can DELETE rows from DB.
DROP POLICY IF EXISTS "lv_delete"        ON public.leaves;
DROP POLICY IF EXISTS "lv_admin_delete"  ON public.leaves;
DROP POLICY IF EXISTS "lv_self_delete"   ON public.leaves;

CREATE POLICY "lv_admin_delete"
  ON public.leaves
  FOR DELETE
  USING ( public.is_admin() );

-- 3. Allow self-update of hidden_for_user (any status)
DROP POLICY IF EXISTS "lv_admin_update" ON public.leaves;

CREATE POLICY "lv_admin_update"
  ON public.leaves
  FOR UPDATE
  USING (
    public.is_admin()
    OR (user_id = auth.uid() AND status = 'pending')
    OR (user_id = auth.uid())   -- self can update hidden_for_user any time
  );

-- 4. notice_hides table — per user, per notice
CREATE TABLE IF NOT EXISTS public.notice_hides (
  notice_id  BIGINT NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id    UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hidden_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (notice_id, user_id)
);

ALTER TABLE public.notice_hides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nh_self_select" ON public.notice_hides;
DROP POLICY IF EXISTS "nh_self_insert" ON public.notice_hides;
DROP POLICY IF EXISTS "nh_self_delete" ON public.notice_hides;

CREATE POLICY "nh_self_select" ON public.notice_hides FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "nh_self_insert" ON public.notice_hides FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "nh_self_delete" ON public.notice_hides FOR DELETE USING (user_id = auth.uid());

DO $$ BEGIN
  RAISE NOTICE '✅ v8 applied — leaves soft-hide + notice_hides table created.';
END $$;
