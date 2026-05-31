-- ═══════════════════════════════════════════════════════════════════
-- v7: Allow employees to permanently delete their OWN leave applications
-- (Admins can already delete any leave via lv_admin_delete)
-- ═══════════════════════════════════════════════════════════════════
-- Run this once in Supabase SQL Editor.

-- Drop old delete policies (clean slate)
DROP POLICY IF EXISTS "lv_admin_delete" ON public.leaves;
DROP POLICY IF EXISTS "lv_self_delete"  ON public.leaves;
DROP POLICY IF EXISTS "lv_delete"       ON public.leaves;

-- Single combined delete policy:
--   • Admin     → can delete ANY leave
--   • Employee  → can delete their OWN leave (any status)
CREATE POLICY "lv_delete"
  ON public.leaves
  FOR DELETE
  USING (
    public.is_admin()
    OR user_id = auth.uid()
  );

-- Helpful confirmation
DO $$ BEGIN
  RAISE NOTICE '✅ v7 applied — employees can now delete their own leave applications.';
END $$;
