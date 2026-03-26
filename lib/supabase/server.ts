import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client (use in Server Components, Route Handlers, Server Actions).
 * Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Bypasses RLS for trusted server-only code. Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
 * (never expose to the browser). If unset, returns null.
 */
export function createSupabaseServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
