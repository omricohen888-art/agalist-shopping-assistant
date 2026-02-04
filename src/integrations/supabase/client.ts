import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bbksunwslrdqmlpwconi.supabase.co";

// ✅ המפתח התקין (Supabase Anon Key)
const SUPABASE_ANON_KEY = "sb_publishable_20ykZzt5npMApmJFZwZhRw_ZdtLRIKn";

// Supabase is configured with valid credentials
export const isSupabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);