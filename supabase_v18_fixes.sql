-- ═══════════════════════════════════════════════════════════════════
-- v18: Schema Cache Fixes & Documents Bucket setup
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure department column exists in profiles (Fix for schema cache issue)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Create documents bucket for Handbook PDF
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket Policies for Documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "documents_read" ON storage.objects;
  DROP POLICY IF EXISTS "documents_upload" ON storage.objects;
  DROP POLICY IF EXISTS "documents_update" ON storage.objects;
  DROP POLICY IF EXISTS "documents_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY "documents_read"   ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "documents_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND (auth.role() = 'authenticated'));
CREATE POLICY "documents_update" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND (auth.role() = 'authenticated'));
CREATE POLICY "documents_delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND (auth.role() = 'authenticated'));

-- 3. Force Supabase PostgREST schema cache to reload
NOTIFY pgrst, 'reload schema';
