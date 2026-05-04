import {
  buildEloApplyPayload,
  type RpmEloRow,
} from "@/lib/rating/process-rating-match-elo";
import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

function normalizeRatingMatchStatus(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Aplica Elo para un `rating_match` existente (misma lógica que el botón "Process Elo" en admin).
 * No comprueba sesión; solo debe llamarse desde acciones de admin ya autenticadas.
 */
export async function runProcessRatingMatchElo(
  ratingMatchId: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Falta configuración de Supabase." };
  }

  const { data: rm, error: rmErr } = await supabase
    .from("rating_matches")
    .select("id, status")
    .eq("id", ratingMatchId)
    .maybeSingle();

  if (rmErr || !rm) {
    return { ok: false, error: rmErr?.message ?? "Rating match no encontrado." };
  }

  const statusRaw = String((rm as { status: string | null }).status ?? "");
  const statusNorm = normalizeRatingMatchStatus(statusRaw);

  const { count: logCount, error: logCountErr } = await supabase
    .from("rating_logs")
    .select("id", { count: "exact", head: true })
    .eq("rating_match_id", ratingMatchId);

  if (logCountErr) {
    return { ok: false, error: logCountErr.message };
  }
  const hasLogs = (logCount ?? 0) > 0;

  if (hasLogs) {
    return { ok: false, error: "Ya existen registros en rating_logs para este partido." };
  }

  if (statusNorm === "processed") {
    return { ok: false, error: "Este rating match ya fue procesado." };
  }

  const canProcess =
    statusNorm === "valid" || (statusNorm === "processing_elo" && !hasLogs);
  if (!canProcess) {
    return {
      ok: false,
      error: `Estado no válido para procesar: ${statusRaw || "(vacío)"}.`,
    };
  }

  const { data: rpmData, error: rpmErr } = await supabase
    .from("rating_match_players")
    .select("player_id, side, role, is_winner")
    .eq("rating_match_id", ratingMatchId)
    .order("side", { ascending: true })
    .order("role", { ascending: true });

  if (rpmErr || !rpmData || rpmData.length !== 4) {
    return { ok: false, error: rpmErr?.message ?? "Se esperaban 4 jugadores." };
  }

  const rpmRows = rpmData as RpmEloRow[];
  const playerIds = rpmRows.map((r) => Number(r.player_id));

  const { data: playersData, error: plErr } = await supabase
    .from("players")
    .select("id, rating, matches_played, wins, losses")
    .in("id", playerIds);

  if (plErr || !playersData || playersData.length !== 4) {
    return { ok: false, error: plErr?.message ?? "No se pudieron cargar los 4 jugadores." };
  }

  const winnerByPlayerId = new Map<number, boolean>(
    rpmRows.map((r) => [Number(r.player_id), Boolean(r.is_winner)]),
  );

  const ratingByPlayerId = new Map<number, number>();
  const matchesPlayedByPlayerId = new Map<number, number>();
  const winsByPlayerId = new Map<number, number>();
  const lossesByPlayerId = new Map<number, number>();

  function nonNegativeInt(value: number | null | undefined): number {
    const n = value == null ? 0 : Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  for (const p of playersData as {
    id: number;
    rating: number | null;
    matches_played: number | null;
    wins: number | null;
    losses: number | null;
  }[]) {
    const id = Number(p.id);
    const r = p.rating == null ? NaN : Number(p.rating);
    if (!Number.isFinite(r)) {
      return { ok: false, error: `Rating inválido para el jugador ${id}.` };
    }
    ratingByPlayerId.set(id, r);
    matchesPlayedByPlayerId.set(id, nonNegativeInt(p.matches_played));
    winsByPlayerId.set(id, nonNegativeInt(p.wins));
    lossesByPlayerId.set(id, nonNegativeInt(p.losses));
  }

  const built = buildEloApplyPayload(ratingMatchId, rpmRows, ratingByPlayerId);
  if (!built.ok) {
    return { ok: false, error: built.error };
  }

  const { logRows, playerUpdates } = built.payload;

  type PlayerEloWrite = (typeof playerUpdates)[number] & {
    matchesPlayedBefore: number;
    matchesPlayedAfter: number;
    winsBefore: number;
    winsAfter: number;
    lossesBefore: number;
    lossesAfter: number;
  };

  const fullPlayerUpdates: PlayerEloWrite[] = playerUpdates.map((u) => {
    const mp = matchesPlayedByPlayerId.get(u.id) ?? 0;
    const won = winnerByPlayerId.get(u.id) === true;
    const w = winsByPlayerId.get(u.id) ?? 0;
    const l = lossesByPlayerId.get(u.id) ?? 0;
    return {
      ...u,
      matchesPlayedBefore: mp,
      matchesPlayedAfter: mp + 1,
      winsBefore: w,
      winsAfter: w + (won ? 1 : 0),
      lossesBefore: l,
      lossesAfter: l + (won ? 0 : 1),
    };
  });

  const { error: insLogErr } = await supabase.from("rating_logs").insert(logRows);
  if (insLogErr) {
    return { ok: false, error: insLogErr.message };
  }

  const appliedIds: number[] = [];
  for (const u of fullPlayerUpdates) {
    const { error: upErr } = await supabase
      .from("players")
      .update({
        rating: u.ratingAfter,
        matches_played: u.matchesPlayedAfter,
        wins: u.winsAfter,
        losses: u.lossesAfter,
      })
      .eq("id", u.id);
    if (upErr) {
      await supabase.from("rating_logs").delete().eq("rating_match_id", ratingMatchId);
      for (const pid of appliedIds) {
        const prev = fullPlayerUpdates.find((x) => x.id === pid)!;
        await supabase
          .from("players")
          .update({
            rating: prev.ratingBefore,
            matches_played: prev.matchesPlayedBefore,
            wins: prev.winsBefore,
            losses: prev.lossesBefore,
          })
          .eq("id", pid);
      }
      return { ok: false, error: upErr.message };
    }
    appliedIds.push(u.id);
  }

  const { error: finErr } = await supabase
    .from("rating_matches")
    .update({ status: "processed", updated_at: new Date().toISOString() })
    .eq("id", ratingMatchId);

  if (finErr) {
    await supabase.from("rating_logs").delete().eq("rating_match_id", ratingMatchId);
    for (const u of fullPlayerUpdates) {
      await supabase
        .from("players")
        .update({
          rating: u.ratingBefore,
          matches_played: u.matchesPlayedBefore,
          wins: u.winsBefore,
          losses: u.lossesBefore,
        })
        .eq("id", u.id);
    }
    return { ok: false, error: finErr.message };
  }

  return { ok: true };
}
