import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const supabase =
  createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY
);

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabasePublishableOrAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
// export const supabase = createClient(supabaseUrl, supabasePublishableOrAnonKey);
