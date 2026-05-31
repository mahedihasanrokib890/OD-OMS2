-- ═══════════════════════════════════════════════════════════════════
-- v10: Monthly activity table for Google-Sheet imported data
-- Stores per-employee per-month summary (worked hours, late, leaves, activity%)
-- so the app no longer needs the spreadsheet.
-- ═══════════════════════════════════════════════════════════════════
-- Run once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.monthly_activity (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,           -- raw name from sheet (fallback if no profile)
  emp_code        TEXT,                    -- e.g. ODEP-2001
  designation     TEXT,
  month           TEXT NOT NULL,           -- 'YYYY-MM'
  month_label     TEXT,                    -- 'May 2026'
  present_days    INT     DEFAULT 0,
  late_count      INT     DEFAULT 0,
  late_hours      NUMERIC(8,2) DEFAULT 0,
  worked_hours    NUMERIC(8,2) DEFAULT 0,
  regular_days    INT     DEFAULT 0,
  regular_hours   NUMERIC(8,2) DEFAULT 0,
  cl_days         NUMERIC(6,1) DEFAULT 0,  -- casual
  sl_days         NUMERIC(6,1) DEFAULT 0,  -- sick
  el_days         NUMERIC(6,1) DEFAULT 0,  -- earned
  col_days        NUMERIC(6,1) DEFAULT 0,  -- compassionate
  ml_days         NUMERIC(6,1) DEFAULT 0,  -- marriage
  ph_days         NUMERIC(6,1) DEFAULT 0,  -- public holiday
  ul_days         NUMERIC(6,1) DEFAULT 0,  -- unnotice
  il_days         NUMERIC(6,1) DEFAULT 0,  -- irresponsible
  total_leave     NUMERIC(6,1) DEFAULT 0,
  activity_pct    NUMERIC(5,2) DEFAULT 0,  -- activity %
  attendance_pct  NUMERIC(5,2) DEFAULT 0,  -- present/regular %
  source          TEXT DEFAULT 'sheet',
  imported_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_name, month)
);

CREATE INDEX IF NOT EXISTS idx_ma_month ON public.monthly_activity(month);
CREATE INDEX IF NOT EXISTS idx_ma_user  ON public.monthly_activity(user_id);

ALTER TABLE public.monthly_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ma_read"  ON public.monthly_activity;
DROP POLICY IF EXISTS "ma_write" ON public.monthly_activity;

-- Everyone authenticated can read; only admins can write/import.
CREATE POLICY "ma_read"  ON public.monthly_activity FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ma_write" ON public.monthly_activity FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$ BEGIN
  RAISE NOTICE '✅ v10 applied — monthly_activity table ready for sheet import.';
END $$;
