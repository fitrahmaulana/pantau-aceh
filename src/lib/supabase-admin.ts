import { createClient } from "@supabase/supabase-js";

// Note: This client should ONLY be used in Server Components or Server Actions.
// Do NOT import this in Client Components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

// We don't throw for service role key immediately to allow build time,
// but it will fail at runtime if missing during admin actions.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
