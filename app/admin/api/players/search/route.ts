import { NextResponse } from "next/server";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Escape `%` and `_` for PostgreSQL ILIKE pattern (inside %...%). */
function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

type PlayerRow = {
  id: number;
  name: string;
  lastname: string;
  email: string | null;
  rating: number;
};

export async function GET(request: Request) {
  const ok = await isAdminSessionValid();
  if (!ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q")?.trim() ?? "";
  const tournamentIdRaw = searchParams.get("tournamentId");
  const tournamentId = tournamentIdRaw ? parseInt(tournamentIdRaw, 10) : NaN;
  const sortByName = searchParams.get("sort") === "name";

  if (raw.length < 2) {
    return NextResponse.json({ players: [] });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  let excluded = new Set<number>();
  if (Number.isInteger(tournamentId) && tournamentId > 0) {
    const { data: rel } = await supabase
      .from("player_tournament")
      .select("player_id")
      .eq("tournament_id", tournamentId);
    excluded = new Set((rel ?? []).map((r) => r.player_id as number));
  }

  const pattern = `%${escapeIlike(raw)}%`;
  const selectCols = "id, name, lastname, email, rating";
  const numericId = /^\d+$/.test(raw) ? parseInt(raw, 10) : null;

  const byIdReq =
    numericId != null && numericId > 0
      ? supabase.from("players").select(selectCols).eq("id", numericId).maybeSingle()
      : Promise.resolve({ data: null, error: null as null });

  const byNameReq = supabase
    .from("players")
    .select(selectCols)
    .ilike("name", pattern)
    .order("rating", { ascending: false })
    .limit(50);

  const byLastReq = supabase
    .from("players")
    .select(selectCols)
    .ilike("lastname", pattern)
    .order("rating", { ascending: false })
    .limit(50);

  const byEmailReq = supabase
    .from("players")
    .select(selectCols)
    .ilike("email", pattern)
    .order("rating", { ascending: false })
    .limit(50);

  const [idRes, nameRes, lastRes, emailRes] = await Promise.all([
    byIdReq,
    byNameReq,
    byLastReq,
    byEmailReq,
  ]);

  const err =
    idRes.error ?? nameRes.error ?? lastRes.error ?? emailRes.error;
  if (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const map = new Map<number, PlayerRow>();

  if (idRes.data && !excluded.has((idRes.data as PlayerRow).id)) {
    const row = idRes.data as PlayerRow;
    map.set(row.id, row);
  }

  for (const res of [nameRes, lastRes, emailRes]) {
    for (const row of (res.data ?? []) as PlayerRow[]) {
      if (!excluded.has(row.id)) {
        map.set(row.id, row);
      }
    }
  }

  const merged = [...map.values()];
  if (sortByName) {
    merged.sort((a, b) => {
      const ln = a.lastname.localeCompare(b.lastname, "es", { sensitivity: "base" });
      if (ln !== 0) return ln;
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    });
  } else {
    merged.sort((a, b) => b.rating - a.rating);
  }

  const players = merged.slice(0, sortByName ? 50 : 25);

  return NextResponse.json({ players });
}
