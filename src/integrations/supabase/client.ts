import { createClient } from '@supabase/supabase-js';

// הגדרת המשתנים ישירות (עוקף את הצורך ב-ENV שנמחק)
const SUPABASE_URL = "https://bbksunwslrdqmlpwconi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJia3N1bndzbHJkcW1scHdjb25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjUyMDEsImV4cCI6MjA4NTU0MTIwMX0.zg6O6wifTJaRiusXtQ1rjJnTEHHYj75yTJnoqZg50tI";

// יצירת הלקוח בלי בדיקות מיותרות שגורמות לקריסה
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// פונקציית עזר למקרה שצריך לבדוק חיבור
export const isSupabaseConfigured = true;