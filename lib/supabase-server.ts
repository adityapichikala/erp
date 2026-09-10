import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client using the Service Role key.
 * Communicates over HTTPS (port 443) — works even when Postgres TCP is blocked.
 * Use this in Server Components and API Routes instead of Prisma when behind a firewall.
 */
export function createServerClient() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
