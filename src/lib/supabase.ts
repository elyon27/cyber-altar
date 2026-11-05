import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createPasswordResetClient() {
  // Keep the recovery session separate from the browser's signed-in pilgrim.
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'cyber-altar-password-reset',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
