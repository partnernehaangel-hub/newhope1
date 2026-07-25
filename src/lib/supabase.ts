import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Data persistence will not work.');
}

// Only initialize if we have a URL, otherwise export a dummy or handle it
export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any); // Or a mock client if preferred
