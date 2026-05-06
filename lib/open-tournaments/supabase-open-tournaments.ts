import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Row shape for `public.open_tournaments` */
export type OpenTournamentDbRow = {
  id: number;
  name: string;
  organizer_id: number;
  slug: string | null;
  venue_id: number | null;
  start_date: string | null;
  end_date: string | null;
  format: string | null;
  category: string | null;
  created_at: string | null;
};

export type OpenTournamentsListResult =
  | { ok: true; rows: OpenTournamentDbRow[] }
  | { ok: false; error: string; rows: OpenTournamentDbRow[] };

export async function fetchOpenTournamentsListFromSupabase(): Promise<OpenTournamentsListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      rows: [],
    };
  }

  const { data, error } = await supabase
    .from("open_tournaments")
    .select("id, name, organizer_id, slug, venue_id, start_date, end_date, format, category, created_at")
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message, rows: [] };
  }

  return { ok: true, rows: (data ?? []) as OpenTournamentDbRow[] };
}
