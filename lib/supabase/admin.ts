import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — uses the SERVICE ROLE KEY.
 * Bypasses Row Level Security completely.
 *
 * ⚠️ NEVER import this file in client components or expose to the browser.
 * ⚠️ Use ONLY in API Route Handlers and Server Actions.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
