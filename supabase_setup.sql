-- ═══════════════════════════════════════════════════════════
-- ODMS Database Schema (Fresh Setup)
-- নতুন Supabase প্রজেক্টে SQL Editor এ paste করে Run করুন
-- ═══════════════════════════════════════════════════════════

-- 1. Main app data table (key-value JSON store)
CREATE TABLE IF NOT EXISTS public.app_data (
  key         TEXT PRIMARY KEY,
  value       JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id             BIGSERIAL PRIMARY KEY,
  user_id        TEXT NOT NULL,
  employee_name  TEXT,
  date           DATE NOT NULL,
  checkin        TIMESTAMPTZ,
  checkout       TIMESTAMPTZ,
  break_start    TIMESTAMPTZ,
  break_end      TIMESTAMPTZ,
  status         TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_date
  ON public.attendance(user_id, date DESC);

-- 3. Row Level Security চালু
ALTER TABLE public.app_data   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 4. Anon key দিয়ে access করার জন্য open policies
DROP POLICY IF EXISTS "allow_all_app_data"   ON public.app_data;
DROP POLICY IF EXISTS "allow_all_attendance" ON public.attendance;

CREATE POLICY "allow_all_app_data"   ON public.app_data
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_attendance" ON public.attendance
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Realtime চালু (live sync এর জন্য)
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- ═══════════════════════════════════════════════════════════
-- ✅ Setup Complete
-- ═══════════════════════════════════════════════════════════
