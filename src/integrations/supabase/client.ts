import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log Supabase configuration status
console.log('Supabase URL configured:', !!supabaseUrl, supabaseUrl ? 'URL exists' : 'URL missing');
console.log('Supabase Anon Key configured:', !!supabaseAnonKey, supabaseAnonKey ? 'Key exists' : 'Key missing');

// Check if Supabase credentials are configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Only create the client if credentials exist
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.info(
    'Supabase not configured. App will work in offline mode with localStorage. ' +
    'To enable cloud sync, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}
