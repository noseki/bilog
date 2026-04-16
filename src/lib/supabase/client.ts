import type { Database } from '@/types/supabase';
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const supabase =
  createSupabaseClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
