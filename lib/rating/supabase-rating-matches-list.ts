import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRatingMatchListRow = {
  id: number;
  playedAt: string;
  side1Label: string;
  side2Label: string;
  /** 1 o 2 según `is_winner`; null si no se puede determinar */
  winningSide: 1 | 2 | null;
};

export type RatingMatchesListResult =
  | { ok: true; matches: AdminRatingMatchListRow[] }
  | { ok: false; error: string; matches: AdminRatingMatchListRow[] };

function playerLabel(p: { name: string | null; lastname: string | null } | null | undefined): string {
  const name = String(p?.name ?? "").trim();
  const lastname = String(p?.lastname ?? "").trim();
  const full = `${name} ${lastname}`.trim();
  return full || "Jugador";
}

function sidePlayersLabel(
  rows: Array<{ player_id: number; role: number }>,
  labelById: Map<number, string>,
): string {
  const sorted = [...rows].sort((a, b) => Number(a.role) - Number(b.role));
  const parts = sorted.map((r) => {
    const pid = Number(r.player_id);
    return labelById.get(pid) ?? `#${pid}`;
  });
  return parts.length ? parts.join(" · ") : "—";
}

/**
 * Lista todos los partidos de rating con parejas y ganador, más reciente primero.
 */
export async function fetchRatingMatchesListFromSupabase(): Promise<RatingMatchesListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      matches: [],
    };
  }

  const { data: matchRows, error: matchErr } = await supabase
    .from("rating_matches")
    .select("id, played_at")
    .order("played_at", { ascending: false });

  if (matchErr) {
    return { ok: false, error: matchErr.message, matches: [] };
  }

  const matches = matchRows ?? [];
  if (matches.length === 0) {
    return { ok: true, matches: [] };
  }

  const matchIds = matches.map((m) => Number((m as { id: unknown }).id)).filter((n) => Number.isFinite(n));

  const { data: rpmData, error: rpmErr } = await supabase
    .from("rating_match_players")
    .select("rating_match_id, player_id, side, role, is_winner")
    .in("rating_match_id", matchIds);

  if (rpmErr) {
    return { ok: false, error: rpmErr.message, matches: [] };
  }

  const allPlayerIds = new Set<number>();
  const rpmByMatch = new Map<
    number,
    Array<{ player_id: number; side: number; role: number; is_winner: boolean }>
  >();

  for (const row of rpmData ?? []) {
    const r = row as {
      rating_match_id: unknown;
      player_id: unknown;
      side: unknown;
      role: unknown;
      is_winner: unknown;
    };
    const mid = Number(r.rating_match_id);
    const pid = Number(r.player_id);
    allPlayerIds.add(pid);
    const list = rpmByMatch.get(mid) ?? [];
    list.push({
      player_id: pid,
      side: Number(r.side),
      role: Number(r.role),
      is_winner: Boolean(r.is_winner),
    });
    rpmByMatch.set(mid, list);
  }

  const { data: playerRows } =
    allPlayerIds.size > 0
      ? await supabase.from("players").select("id, name, lastname").in("id", [...allPlayerIds])
      : { data: [] as { id: number; name: string; lastname: string }[] | null };

  const labelById = new Map<number, string>();
  for (const p of playerRows ?? []) {
    labelById.set(Number(p.id), playerLabel(p));
  }

  const out: AdminRatingMatchListRow[] = [];

  for (const m of matches) {
    const id = Number((m as { id: unknown }).id);
    const playedAt = String((m as { played_at: string | null }).played_at ?? "");
    const rpm = rpmByMatch.get(id) ?? [];
    const side1 = rpm.filter((x) => Number(x.side) === 1);
    const side2 = rpm.filter((x) => Number(x.side) === 2);

    let winningSide: 1 | 2 | null = null;
    const w1 = side1.some((x) => x.is_winner);
    const w2 = side2.some((x) => x.is_winner);
    if (w1 && !w2) winningSide = 1;
    else if (w2 && !w1) winningSide = 2;

    out.push({
      id,
      playedAt,
      side1Label: sidePlayersLabel(side1, labelById),
      side2Label: sidePlayersLabel(side2, labelById),
      winningSide,
    });
  }

  return { ok: true, matches: out };
}
