import type { Tournament, TournamentFormat } from "@/data/tournaments";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Row shape for `public.tournaments` */
export type TournamentDbRow = {
  id: number;
  name: string;
  slug: string | null;
  format: string | null;
  status: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  max_teams: number | null;
  total_rounds: number | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  image: string | null;
};

function normalizeImageUrl(image: string | null): string | undefined {
  if (!image?.trim()) return undefined;
  const t = image.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return t.startsWith("/") ? t : `/${t}`;
}

function parseStartDate(start: string | null): Pick<
  Tournament,
  "dateISO" | "time24h" | "dateLabel" | "timeLabel"
> {
  if (!start) {
    return {
      dateISO: "",
      time24h: "00:00",
      dateLabel: "Por confirmar",
      timeLabel: "—",
    };
  }
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) {
    return {
      dateISO: "",
      time24h: "00:00",
      dateLabel: "Por confirmar",
      timeLabel: "—",
    };
  }
  const dateISO = d.toISOString().slice(0, 10);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const time24h = `${hours}:${minutes}`;
  const dateLabel = d.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeLabel = d.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateISO, time24h, dateLabel, timeLabel };
}

function toFormat(f: string | null): TournamentFormat {
  return f === "american" ? "american" : "swiss";
}

function isPastRow(row: TournamentDbRow, now: number): boolean {
  if (row.status === "completed") return true;
  if (row.end_date) {
    const end = new Date(row.end_date).getTime();
    if (!Number.isNaN(end) && end < now) return true;
  }
  return false;
}

function rowToTournament(row: TournamentDbRow, listStatus: Tournament["status"]): Tournament {
  const dates = parseStartDate(row.start_date);
  const slug = row.slug?.trim() || `tournament-${row.id}`;
  const maxTeams = row.max_teams ?? 0;
  return {
    id: String(row.id),
    slug,
    name: row.name,
    ...dates,
    playerCount: maxTeams > 0 ? maxTeams * 2 : 0,
    format: toFormat(row.format),
    rounds: row.total_rounds ?? 0,
    status: listStatus,
    imageUrl: normalizeImageUrl(row.image),
    location: row.location?.trim() || undefined,
  };
}

function statusFromRow(row: TournamentDbRow): Tournament["status"] {
  if (row.status === "cancelled") return "cancelled";
  return isPastRow(row, Date.now()) ? "completed" : "upcoming";
}

export type TournamentsListResult =
  | { ok: true; upcoming: Tournament[]; past: Tournament[] }
  | { ok: false; error: string; upcoming: Tournament[]; past: Tournament[] };

/**
 * Loads tournaments from Supabase and splits into upcoming vs past.
 * Excludes `cancelled`. Past = `status === 'completed'` OR `end_date` in the past.
 */
export async function fetchTournamentsListFromSupabase(): Promise<TournamentsListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      upcoming: [],
      past: [],
    };
  }

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    return {
      ok: false,
      error: error.message,
      upcoming: [],
      past: [],
    };
  }

  const rows = ((data ?? []) as TournamentDbRow[]).filter((r) => r.status !== "cancelled");
  const now = Date.now();

  const upcoming: Tournament[] = [];
  const past: Tournament[] = [];

  for (const row of rows) {
    const pastFlag = isPastRow(row, now);
    if (pastFlag) {
      past.push(rowToTournament(row, "completed"));
    } else {
      upcoming.push(rowToTournament(row, "upcoming"));
    }
  }

  upcoming.sort((a, b) => {
    if (!a.dateISO && !b.dateISO) return 0;
    if (!a.dateISO) return 1;
    if (!b.dateISO) return -1;
    return a.dateISO.localeCompare(b.dateISO);
  });

  past.sort((a, b) => {
    if (!a.dateISO && !b.dateISO) return 0;
    if (!a.dateISO) return 1;
    if (!b.dateISO) return -1;
    return b.dateISO.localeCompare(a.dateISO);
  });

  return { ok: true, upcoming, past };
}

export type TournamentBySlugResult =
  | { ok: true; tournament: Tournament }
  | { ok: false; error: string; tournament: null };

/**
 * Loads one tournament by slug from Supabase.
 */
export async function fetchTournamentBySlugFromSupabase(
  slug: string
): Promise<TournamentBySlugResult> {
  const trimmedSlug = slug.trim();
  if (!trimmedSlug) {
    return { ok: false, error: "Slug de torneo inválido.", tournament: null };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      tournament: null,
    };
  }

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", trimmedSlug)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message, tournament: null };
  }

  if (!data) {
    return { ok: false, error: "Torneo no encontrado.", tournament: null };
  }

  const row = data as TournamentDbRow;
  const tournament = rowToTournament(row, statusFromRow(row));
  return { ok: true, tournament };
}
