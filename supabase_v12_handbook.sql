-- ═══════════════════════════════════════════════════════════════════════
-- OD-HRMS · Employee Handbook Storage
-- v12 — Storage bucket for documents and handbook
--
-- ► Supabase SQL Editor → New query → পেস্ট করে RUN চাপুন
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Create a public storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Setup Storage Policies
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
-- ✅ Storage bucket "documents" is ready!
-- ═══════════════════════════════════════════════════════════════════════
