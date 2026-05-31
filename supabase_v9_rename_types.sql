-- ═══════════════════════════════════════════════════════════════════
-- v9: Rename "কর্মী টাইপ" → "এমপ্লয়ী টাইপ" everywhere in DB.
-- Run once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Existing employee_types rows
UPDATE public.employee_types
SET name_bn = REPLACE(name_bn, 'কর্মী টাইপ', 'এমপ্লয়ী টাইপ')
WHERE name_bn LIKE '%কর্মী টাইপ%';

-- 2. Generic standalone "কর্মী" → "এমপ্লয়ী" inside employee_types.name_bn
UPDATE public.employee_types
SET name_bn = REPLACE(name_bn, 'কর্মী', 'এমপ্লয়ী')
WHERE name_bn LIKE '%কর্মী%';

-- 3. Profiles designation fallback "কর্মী" → "এমপ্লয়ী"
UPDATE public.profiles
SET designation = REPLACE(designation, 'কর্মী', 'এমপ্লয়ী')
WHERE designation LIKE '%কর্মী%';

DO $$ BEGIN
  RAISE NOTICE '✅ v9 applied — employee type labels updated.';
END $$;
