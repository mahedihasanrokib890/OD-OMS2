-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · Database Optimization & Auto-Cleanup
-- Supabase SQL Editor এ রান করুন
-- এটা database ভরে যাওয়া থেকে বাঁচাবে
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- 1. পুরনো attendance data auto-delete (১ বছরের বেশি পুরনো)
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void LANGUAGE PLPGSQL SECURITY DEFINER AS $$
BEGIN
  -- ১ বছরের বেশি পুরনো attendance রেকর্ড ডিলিট
  DELETE FROM public.attendance
  WHERE date < (CURRENT_DATE - INTERVAL '1 year');

  -- ৬ মাসের বেশি পুরনো non-active notice ডিলিট
  DELETE FROM public.notices
  WHERE is_active = false
    AND updated_at < (NOW() - INTERVAL '6 months');

  -- ৬ মাসের বেশি পুরনো notice_reads ডিলিট
  DELETE FROM public.notice_reads
  WHERE read_at < (NOW() - INTERVAL '6 months');

  -- ১ বছরের বেশি পুরনো cancelled/rejected leave ডিলিট
  DELETE FROM public.leaves
  WHERE status IN ('cancelled', 'rejected')
    AND updated_at < (NOW() - INTERVAL '1 year');
END;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. Database Storage Size চেক করার function
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_db_size()
RETURNS TABLE(table_name TEXT, row_count BIGINT, size_kb NUMERIC)
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT
    relname::TEXT as table_name,
    n_live_tup::BIGINT as row_count,
    ROUND(pg_total_relation_size(oid) / 1024.0, 2) as size_kb
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(oid) DESC;
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 3. Attendance table এ extra columns যোগ (যদি না থাকে)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS personal_out  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS personal_in   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS personal_minutes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leave_code    TEXT;

-- ─────────────────────────────────────────────────────────────────────
-- 4. Profiles table এ extra columns (যদি না থাকে)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS position_title TEXT,
  ADD COLUMN IF NOT EXISTS position_rank  INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS department     TEXT,
  ADD COLUMN IF NOT EXISTS role           TEXT DEFAULT 'employee';

-- ─────────────────────────────────────────────────────────────────────
-- 5. Leave Policies table (ছুটির ধরন ও বার্ষিক সীমা)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leave_policies (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,          -- CL, SL, EL, etc.
  name_bn       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  yearly_limit  INT,                           -- NULL = unlimited
  is_paid       BOOLEAN NOT NULL DEFAULT true,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.leave_policies (code, name_bn, name_en, yearly_limit, is_paid, display_order)
VALUES
  ('CL',  'নৈমিত্তিক ছুটি',      'Casual Leave',        10,   true,  1),
  ('SL',  'অসুস্থতা ছুটি',       'Sick Leave',          14,   true,  2),
  ('EL',  'অর্জিত ছুটি',         'Earned Leave',        15,   true,  3),
  ('CoL', 'সমবেদনা ছুটি',        'Compassionate Leave', 5,    true,  4),
  ('ML',  'বিবাহ ছুটি',          'Marriage Leave',      7,    true,  5),
  ('PH',  'সরকারি ছুটি',         'Public Holiday',      NULL, true,  6),
  ('UL',  'অননুমোদিত ছুটি',     'Unauthorised Leave',  NULL, false, 7),
  ('IL',  'দায়িত্বহীন ছুটি',    'Irresponsible Leave', NULL, false, 8)
ON CONFLICT (code) DO NOTHING;

-- Leave policies RLS
ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lp_read"  ON public.leave_policies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "lp_write" ON public.leave_policies FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- 6. Leave table এ leave_code column যোগ (যদি না থাকে)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.leaves
  ADD COLUMN IF NOT EXISTS leave_code TEXT DEFAULT 'CL';

-- ─────────────────────────────────────────────────────────────────────
-- 7. Indexes যোগ (query speed বাড়াবে)
-- ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_att_date_user     ON public.attendance(date DESC, user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_user_date  ON public.leaves(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_leaves_status_date ON public.leaves(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_created   ON public.notices(created_at DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles(email);

-- ─────────────────────────────────────────────────────────────────────
-- 8. এখনই একবার cleanup চালাও
-- ─────────────────────────────────────────────────────────────────────
SELECT public.cleanup_old_data();

-- ─────────────────────────────────────────────────────────────────────
-- 9. Database size দেখো
-- ─────────────────────────────────────────────────────────────────────
SELECT * FROM public.get_db_size();

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ Optimization Complete!
-- এখন প্রতি মাসে একবার cleanup চালালেই database ছোট থাকবে।
-- SQL Editor এ: SELECT public.cleanup_old_data();
-- ═══════════════════════════════════════════════════════════════════════
