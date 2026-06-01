-- ═══════════════════════════════════════════════════════════════════
-- v14: Bonus settings for Employees based on Work Hours and Attendance
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.bonus_settings (
  id INT PRIMARY KEY DEFAULT 1,
  bonus_per_hour NUMERIC(8,2) DEFAULT 0,
  bonus_attendance_pct NUMERIC(5,2) DEFAULT 100,
  bonus_attendance_amount NUMERIC(8,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT bonus_settings_single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.bonus_settings (id, bonus_per_hour, bonus_attendance_pct, bonus_attendance_amount) 
VALUES (1, 0, 100, 0)
ON CONFLICT (id) DO NOTHING;

-- Policies
ALTER TABLE public.bonus_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bonus_read" ON public.bonus_settings;
DROP POLICY IF EXISTS "bonus_write" ON public.bonus_settings;

CREATE POLICY "bonus_read" ON public.bonus_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "bonus_write" ON public.bonus_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DO $$ BEGIN
  RAISE NOTICE '✅ v14 applied — bonus_settings table ready.';
END $$;
