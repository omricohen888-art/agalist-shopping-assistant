-- 1. Create System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Insert Default Maintenance Mode (if not exists)
INSERT INTO public.system_settings (key, value, description)
VALUES ('maintenance_mode', 'false'::jsonb, 'Global maintenance mode switch')
ON CONFLICT (key) DO NOTHING;

-- 3. Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies for system_settings
-- Allow READ to everyone (so the app can check maintenance mode)
CREATE POLICY "Allow public read system_settings"
ON public.system_settings FOR SELECT
TO public
USING (true);

-- Allow UPDATE only to authenticated users (The app logic will enforce specific email check)
-- Ideally, this should be restricted to specific UUIDs or checking email via auth.uid()
CREATE POLICY "Allow authenticated update system_settings"
ON public.system_settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Create RPC Function to get Admin Stats
-- This function runs with security definer to bypass RLS and count total users/lists
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users INT;
    total_lists INT;
    recent_users JSONB;
BEGIN
    -- Get total users count from auth.users (requires specific permissions or view)
    -- Note: Standard Postgres functions cannot easily query auth.users directly without grants.
    -- However, in Supabase RPC `security definer`, we can access it if the owner has permissions.
    -- If this fails, ensure the postgres role has access to auth schema.
    SELECT COUNT(*) INTO total_users FROM auth.users;

    -- Get total lists count
    SELECT COUNT(*) INTO total_lists FROM public.lists;

    -- Get recent 5 users (emails and last sign in)
    SELECT jsonb_agg(t) INTO recent_users
    FROM (
        SELECT email, last_sign_in_at
        FROM auth.users
        ORDER BY last_sign_in_at DESC NULLS LAST
        LIMIT 5
    ) t;

    RETURN jsonb_build_object(
        'total_users', total_users,
        'total_lists', total_lists,
        'recent_users', recent_users
    );
END;
$$;
