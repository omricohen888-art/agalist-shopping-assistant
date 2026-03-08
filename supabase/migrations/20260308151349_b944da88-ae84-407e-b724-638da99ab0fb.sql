-- Remove overly permissive public SELECT policies on system_settings
-- Keep only admin access and a restricted public read for non-sensitive keys
DROP POLICY IF EXISTS "Allow public read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Public Read Access" ON public.system_settings;

-- Create a restricted public read policy that excludes sensitive keys
CREATE POLICY "Public read non-sensitive settings"
ON public.system_settings
FOR SELECT
USING (key NOT IN ('admin_pin'));