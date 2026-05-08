import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Row shape for `public.organizers` */
export type OrganizerDbRow = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  whatsapp: string | null;
  created_at: string | null;
};

export type OrganizersListResult =
  | { ok: true; organizers: OrganizerDbRow[] }
  | { ok: false; error: string; organizers: OrganizerDbRow[] };

export async function fetchOrganizersListFromSupabase(): Promise<OrganizersListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      organizers: [],
    };
  }

  const { data, error } = await supabase
    .from("organizers")
    .select("id, name, slug, image, whatsapp, created_at")
    .order("name", { ascending: true });

  if (error) {
    return { ok: false, error: error.message, organizers: [] };
  }

  return { ok: true, organizers: (data ?? []) as OrganizerDbRow[] };
}

export type OrganizerRankedPlayer = {
  id: number;
  name: string;
  lastname: string;
  rating: number;
  matches_played: number;
  stars: number | null;
};

export type OrganizerRankedPlayersResult =
  | { ok: true; players: OrganizerRankedPlayer[] }
  | { ok: false; error: string; players: OrganizerRankedPlayer[] };

type OrganizerPlayerJoinRow = {
  player_id: number;
  players:
    | OrganizerRankedPlayer
    | OrganizerRankedPlayer[]
    | null;
};

function unwrapJoinedPlayer(
  value: OrganizerPlayerJoinRow["players"],
): OrganizerRankedPlayer | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/**
 * Players linked to an organizer through `organizer_players`,
 * joined with `players` and sorted by rating desc (ties by lastname/name).
 */
export async function fetchOrganizerRankedPlayersFromSupabase(
  organizerId: number,
): Promise<OrganizerRankedPlayersResult> {
  if (!Number.isInteger(organizerId) || organizerId < 1) {
    return { ok: false, error: "Organizer id invalido", players: [] };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      players: [],
    };
  }

  const { data, error } = await supabase
    .from("organizer_players")
    .select("player_id, players(id, name, lastname, rating, matches_played, stars)")
    .eq("organizer_id", organizerId);

  if (error) {
    return { ok: false, error: error.message, players: [] };
  }

  const rows = (data ?? []) as OrganizerPlayerJoinRow[];
  const players = rows
    .map((r) => unwrapJoinedPlayer(r.players))
    .filter((p): p is OrganizerRankedPlayer => p != null)
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      const byLast = a.lastname.localeCompare(b.lastname, "es", { sensitivity: "base" });
      if (byLast !== 0) return byLast;
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    });

  return { ok: true, players };
}

export type OrganizerBySlugResult =
  | { ok: true; organizer: OrganizerDbRow }
  | { ok: false; error: string };

export async function fetchOrganizerBySlugFromSupabase(slug: string): Promise<OrganizerBySlugResult> {
  const trimmed = slug?.trim();
  if (!trimmed) {
    return { ok: false, error: "Slug invalido" };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
    };
  }

  const { data, error } = await supabase
    .from("organizers")
    .select("id, name, slug, image, whatsapp, created_at")
    .eq("slug", trimmed)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data) {
    return { ok: false, error: "Organizador no encontrado" };
  }

  return { ok: true, organizer: data as OrganizerDbRow };
}
