/**
 * Static Supabase client — uses the vanilla @supabase/supabase-js client.
 *
 * WHO SHOULD USE THIS:
 *   - `generateStaticParams()` — runs at build time, no request context
 *   - Any server function that reads public data and does NOT need user context
 *
 * WHO SHOULD NOT USE THIS:
 *   - Server Actions (use @/lib/supabase/server — needs auth context)
 *   - Admin queries (need RLS with user session)
 *   - Anything calling protected routes
 *
 * RLS note: this client authenticates as the anon role. Supabase RLS policies
 * must allow anon SELECT on public data (articles_listing view, etc.) for this
 * to work. Admin-only tables will correctly return 0 rows / permission errors.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let _client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Returns a singleton static Supabase client.
 * Safe to call multiple times — memoized at module level.
 *
 * Does NOT call cookies() or headers() — safe for build-time execution.
 */
export function createStaticClient(): ReturnType<typeof createSupabaseClient<Database>> {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "[static-supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "These must be set as build-time environment variables."
    );
  }

  _client = createSupabaseClient<Database>(url, key, {
    auth: {
      // Disable session persistence — this client is stateless / build-time only
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return _client;
}
