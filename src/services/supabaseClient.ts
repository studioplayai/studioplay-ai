import { createClient } from '@supabase/supabase-js'

// Direct configuration (since .env is not available in AI Studio)
const SUPABASE_URL = 'https://hxdvszjoaicluogpoidl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZHZzempvYWljbHVvZ3BvaWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NzgyOTMsImV4cCI6MjA4MTU1NDI5M30.km2w5bKc6TdwU4JvFFcxWR-6eErKm82YjDPUMH1v4Fs'

/**
* Robust check for Supabase configuration.
*/
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.startsWith('https://') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.length > 20
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      Prefer: 'return=minimal',
    },
  },
});

// אופציונלי לדיבאג
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}



// Logging
if (isSupabaseConfigured()) {
  console.log('StudioPlay: Supabase connection initialized.');
} else {
  console.warn('StudioPlay: Running in local-only mode (Missing Supabase Credentials).');
}