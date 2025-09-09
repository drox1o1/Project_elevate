// Supabase client for server-side usage (Server Components and Server Actions)
import { createClient } from "@supabase/supabase-js"

// For direct server usage without cookies (like in Server Actions)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
