import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - these are publishable keys (safe to include in code)
const supabaseUrl = 'https://bbksunwslrdqmlpwconi.supabase.co';
const supabaseAnonKey = 'sb_publishable_2OykZzt5npMApmJFZwZhRw_ZDtLRIKn';

// Supabase is now always configured
export const isSupabaseConfigured = true;

// Create the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized with URL:', supabaseUrl);
