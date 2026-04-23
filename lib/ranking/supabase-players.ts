import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Row shape for `public.players` */
export type PlayerDbRow = {
  id: number;
  name: string;
  email: string | null;
  linkedin: string | null;
  instagram: string | null;
  x_twitter: string | null;
  rating: number;
  matches_played: number;
  wins: number;
  losses: number;
  created_at: string | null;
  updated_at: string | null;
  lastname: string;
};

export type PlayersListResult =
  | { ok: true; players: PlayerDbRow[] }
  | { ok: false; error: string; players: PlayerDbRow[] };

/**
 * Loads all players from Supabase, ordered by ELO (`rating`) descending.
 */
export async function fetchPlayersListFromSupabase(): Promise<PlayersListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      players: [],
    };
  }

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("rating", { ascending: false })
    .order("name", { ascending: true })
    .order("lastname", { ascending: true });

  if (error) {
    return { ok: false, error: error.message, players: [] };
  }

  return { ok: true, players: (data ?? []) as PlayerDbRow[] };
}

export async function fetchPlayerByIdFromSupabase(id: string): Promise<PlayerDbRow | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) return null;

  const { data, error } = await supabase.from("players").select("*").eq("id", n).maybeSingle();

  if (error || !data) return null;
  return data as PlayerDbRow;
}
