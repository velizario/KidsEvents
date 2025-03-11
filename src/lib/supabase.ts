import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallbacks to prevent errors
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
