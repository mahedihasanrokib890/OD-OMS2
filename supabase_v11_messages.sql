-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · মেসেঞ্জার চ্যাট সিস্টেম
-- v11 — Messages table + RLS + Realtime
--
-- ► Supabase SQL Editor → New query → পেস্ট করে RUN চাপুন
-- ═══════════════════════════════════════════════════════════════════════

-- 1. MESSAGES TABLE
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

-- 2. ROW LEVEL SECURITY
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Everyone can read messages they sent or received
CREATE POLICY "msg_read" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can send messages (insert)
CREATE POLICY "msg_insert" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Sender can update their own messages (for delete_all, deleted_for)
CREATE POLICY "msg_update" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Only admin can hard-delete
CREATE POLICY "msg_delete" ON public.messages
  FOR DELETE USING (public.is_admin());

-- 3. REALTIME
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
  IF NOT FOUND THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ Messages table ready!
-- এখন অ্যাপে গিয়ে ইনবক্স → মেসেজ ট্যাবে চ্যাট করুন।
-- ═══════════════════════════════════════════════════════════════════════
