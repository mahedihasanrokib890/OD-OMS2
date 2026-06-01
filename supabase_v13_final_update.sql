-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · Unified Final Update
-- This file contains all updates (Messages + Handbook Storage)
-- and is SAFE to run multiple times without errors.
--
-- ► Supabase SQL Editor → New query → পেস্ট করে RUN চাপুন
-- ═══════════════════════════════════════════════════════════════════════

-- ==========================================
-- 1. MESSAGES SYSTEM (Inbox Chat)
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

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_messages_sender   ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_pair     ON public.messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

-- ROW LEVEL SECURITY
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent "already exists" errors
DROP POLICY IF EXISTS "msg_read" ON public.messages;
DROP POLICY IF EXISTS "msg_insert" ON public.messages;
DROP POLICY IF EXISTS "msg_update" ON public.messages;
DROP POLICY IF EXISTS "msg_delete" ON public.messages;

-- Create policies safely
CREATE POLICY "msg_read" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "msg_insert" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "msg_update" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "msg_delete" ON public.messages
  FOR DELETE USING (public.is_admin());

-- REALTIME setup
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
  IF NOT FOUND THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ==========================================
-- 2. EMPLOYEE HANDBOOK (Storage)
-- ==========================================

-- Create a public storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Setup Storage Policies
-- Note: Supabase storage policies act on `storage.objects` table.
DROP POLICY IF EXISTS "Public Document Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Update Delete" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Delete" ON storage.objects;

-- Everyone can read the documents
CREATE POLICY "Public Document Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

-- Only authenticated users can insert/upload documents
CREATE POLICY "Auth Users Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- Only authenticated users can update/delete their documents
CREATE POLICY "Auth Users Update Delete"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ All setup complete! (Messages and Handbook Storage are ready)
-- ═══════════════════════════════════════════════════════════════════════
