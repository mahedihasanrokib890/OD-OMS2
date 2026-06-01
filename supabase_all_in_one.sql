-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · All In One SQL (v10 + v11 + v12)
-- Monthly Activity, Messages (Chat), and Handbook Storage
-- This file is SAFE to run multiple times without errors.
--
-- ► Supabase SQL Editor → New query → পেস্ট করে RUN চাপুন
-- ═══════════════════════════════════════════════════════════════════════

-- ==========================================
-- 1. MONTHLY ACTIVITY (v10)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.monthly_activity (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_name   TEXT NOT NULL,
  emp_code        TEXT,
  designation     TEXT,
  month           TEXT NOT NULL,
  month_label     TEXT,
  present_days    INT     DEFAULT 0,
  late_count      INT     DEFAULT 0,
  late_hours      NUMERIC(8,2) DEFAULT 0,
  worked_hours    NUMERIC(8,2) DEFAULT 0,
  regular_days    INT     DEFAULT 0,
  regular_hours   NUMERIC(8,2) DEFAULT 0,
  cl_days         NUMERIC(6,1) DEFAULT 0,
  sl_days         NUMERIC(6,1) DEFAULT 0,
  el_days         NUMERIC(6,1) DEFAULT 0,
  col_days        NUMERIC(6,1) DEFAULT 0,
  ml_days         NUMERIC(6,1) DEFAULT 0,
  ph_days         NUMERIC(6,1) DEFAULT 0,
  ul_days         NUMERIC(6,1) DEFAULT 0,
  il_days         NUMERIC(6,1) DEFAULT 0,
  total_leave     NUMERIC(6,1) DEFAULT 0,
  activity_pct    NUMERIC(5,2) DEFAULT 0,
  attendance_pct  NUMERIC(5,2) DEFAULT 0,
  sort_order      INT DEFAULT 0,
  source          TEXT DEFAULT 'sheet',
  imported_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_name, month)
);

CREATE INDEX IF NOT EXISTS idx_ma_month ON public.monthly_activity(month);
CREATE INDEX IF NOT EXISTS idx_ma_user  ON public.monthly_activity(user_id);

ALTER TABLE public.monthly_activity ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE public.monthly_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ma_read"  ON public.monthly_activity;
DROP POLICY IF EXISTS "ma_write" ON public.monthly_activity;

CREATE POLICY "ma_read"  ON public.monthly_activity FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ma_write" ON public.monthly_activity FOR ALL    USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ==========================================
-- 2. MESSAGES SYSTEM (v11)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.messages (
  id            BIGSERIAL PRIMARY KEY,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_emoji      BOOLEAN NOT NULL DEFAULT false,
  deleted_for   UUID[] NOT NULL DEFAULT '{}',
  deleted_all   BOOLEAN NOT NULL DEFAULT false,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender   ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_pair     ON public.messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_read" ON public.messages;
DROP POLICY IF EXISTS "msg_insert" ON public.messages;
DROP POLICY IF EXISTS "msg_update" ON public.messages;
DROP POLICY IF EXISTS "msg_delete" ON public.messages;

CREATE POLICY "msg_read" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "msg_insert" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "msg_update" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "msg_delete" ON public.messages
  FOR DELETE USING (public.is_admin());

DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
  IF NOT FOUND THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ==========================================
-- 3. EMPLOYEE HANDBOOK STORAGE (v12)
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Document Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update Delete" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Delete" ON storage.objects;

CREATE POLICY "Public Document Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Auth Users Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Update Delete"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ All setup complete! (Monthly Activity, Messages, Handbook Storage ready)
-- ═══════════════════════════════════════════════════════════════════════
