import { createClient } from '@supabase/supabase-js';

// Si el usuario define estas variables en su archivo .env o en Ajustes, se conecta automáticamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('iso21001_supabase_url') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('iso21001_supabase_key') || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
