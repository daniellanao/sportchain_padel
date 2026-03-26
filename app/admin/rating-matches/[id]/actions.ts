"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
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

function ratingMatchPath(id: number): string {
  return `/admin/rating-matches/${id}`;
}

function toPositiveInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

const EXPECTED_SLOTS: Array<{ side: number; role: number }> = [
  { side: 1, role: 1 },
  { side: 1, role: 2 },
  { side: 2, role: 1 },
  { side: 2, role: 2 },
];

export async function updateRatingMatchPlayersAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const ratingMatchId = toPositiveInt(formData.get("ratingMatchId"));
  if (!ratingMatchId) {
    redirect(`/admin/tournaments?error=${encodeURIComponent("Rating match inválido.")}`);
  }

  const winnerRaw = String(formData.get("winnerSide") ?? "").trim();
  const winnerSide = winnerRaw === "1" || winnerRaw === "2" ? Number(winnerRaw) : null;
  if (winnerSide == null) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Selecciona el equipo ganador.")}`
    );
  }

  const rowIdEntries = formData.getAll("rowId");
  const playerIdEntries = formData.getAll("playerId");
  if (rowIdEntries.length !== 4 || playerIdEntries.length !== 4) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Formulario incompleto (se esperan 4 jugadores).")}`
    );
  }

  const pairs: { rowId: number; playerId: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const rowId = toPositiveInt(rowIdEntries[i] ?? null);
    const playerId = toPositiveInt(playerIdEntries[i] ?? null);
    if (rowId == null || playerId == null) {
      redirect(
        `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("IDs inválidos.")}`
      );
    }
    pairs.push({ rowId, playerId });
  }

  const chosenPlayers = pairs.map((p) => p.playerId);
  if (new Set(chosenPlayers).size !== 4) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Los cuatro jugadores deben ser distintos.")}`
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Falta configuración de Supabase.")}`
    );
  }

  const { data: rpmRows, error: fetchErr } = await supabase
    .from("rating_match_players")
    .select("id, rating_match_id, side, role")
    .eq("rating_match_id", ratingMatchId)
    .order("side", { ascending: true })
    .order("role", { ascending: true });

  if (fetchErr || !rpmRows || rpmRows.length !== 4) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent(
        fetchErr?.message ?? "Se esperaban exactamente 4 filas de jugadores."
      )}`
    );
  }

  for (let i = 0; i < 4; i++) {
    const dbRow = rpmRows[i] as { id: number; rating_match_id: number; side: number; role: number };
    const exp = EXPECTED_SLOTS[i];
    if (Number(dbRow.side) !== exp.side || Number(dbRow.role) !== exp.role) {
      redirect(
        `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent(
          "Estructura de jugadores inesperada (side/role)."
        )}`
      );
    }
    if (Number(dbRow.id) !== pairs[i].rowId) {
      redirect(
        `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Datos desincronizados; recarga la página.")}`
      );
    }
  }

  for (let i = 0; i < 4; i++) {
    const { rowId, playerId } = pairs[i];
    const side = EXPECTED_SLOTS[i].side;
    const isWinner = side === winnerSide;
    const { error: upErr } = await supabase
      .from("rating_match_players")
      .update({ player_id: playerId, is_winner: isWinner })
      .eq("id", rowId)
      .eq("rating_match_id", ratingMatchId);

    if (upErr) {
      redirect(`${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent(upErr.message)}`);
    }
  }

  revalidatePath(ratingMatchPath(ratingMatchId));
  redirect(`${ratingMatchPath(ratingMatchId)}?success=${encodeURIComponent("Jugadores actualizados.")}`);
}

export async function processRatingMatchEloAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const ratingMatchId = toPositiveInt(formData.get("ratingMatchId"));
  if (!ratingMatchId) {
    redirect(`/admin/tournaments?error=${encodeURIComponent("Rating match inválido.")}`);
  }

  const path = ratingMatchPath(ratingMatchId);
  const supabase = createSupabaseServiceRoleClient() ?? createSupabaseServerClient();
  if (!supabase) {
    redirect(`${path}?error=${encodeURIComponent("Falta configuración de Supabase.")}`);
  }

  const { data: rm, error: rmErr } = await supabase
    .from("rating_matches")
    .select("id, status")
    .eq("id", ratingMatchId)
    .maybeSingle();

  if (rmErr || !rm) {
    redirect(`${path}?error=${encodeURIComponent(rmErr?.message ?? "Rating match no encontrado.")}`);
  }

  const statusRaw = String((rm as { status: string | null }).status ?? "");
  const statusNorm = normalizeRatingMatchStatus(statusRaw);

  const { count: logCount, error: logCountErr } = await supabase
    .from("rating_logs")
    .select("id", { count: "exact", head: true })
    .eq("rating_match_id", ratingMatchId);

  if (logCountErr) {
    redirect(`${path}?error=${encodeURIComponent(logCountErr.message)}`);
  }
  const hasLogs = (logCount ?? 0) > 0;

  if (hasLogs) {
    redirect(
      `${path}?error=${encodeURIComponent("Ya existen registros en rating_logs para este partido.")}`
    );
  }

  if (statusNorm === "processed") {
    redirect(`${path}?error=${encodeURIComponent("Este rating match ya fue procesado.")}`);
  }

  const canProcess =
    statusNorm === "valid" ||
    (statusNorm === "processing_elo" && !hasLogs);
  if (!canProcess) {
    redirect(
      `${path}?error=${encodeURIComponent(
        `Estado no válido para procesar: ${statusRaw || "(vacío)"}.`
      )}`
    );
  }

  const { data: rpmData, error: rpmErr } = await supabase
    .from("rating_match_players")
    .select("player_id, side, role, is_winner")
    .eq("rating_match_id", ratingMatchId)
    .order("side", { ascending: true })
    .order("role", { ascending: true });

  if (rpmErr || !rpmData || rpmData.length !== 4) {
    redirect(`${path}?error=${encodeURIComponent(rpmErr?.message ?? "Se esperaban 4 jugadores.")}`);
  }

  const rpmRows = rpmData as RpmEloRow[];
  const playerIds = rpmRows.map((r) => Number(r.player_id));

  const { data: playersData, error: plErr } = await supabase
    .from("players")
    .select("id, rating, matches_played, wins, losses")
    .in("id", playerIds);

  if (plErr || !playersData || playersData.length !== 4) {
    redirect(
      `${path}?error=${encodeURIComponent(plErr?.message ?? "No se pudieron cargar los 4 jugadores.")}`
    );
  }

  const winnerByPlayerId = new Map<number, boolean>(
    rpmRows.map((r) => [Number(r.player_id), Boolean(r.is_winner)])
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
      redirect(
        `${path}?error=${encodeURIComponent(`Rating inválido para el jugador ${id}.`)}`
      );
    }
    ratingByPlayerId.set(id, r);
    matchesPlayedByPlayerId.set(id, nonNegativeInt(p.matches_played));
    winsByPlayerId.set(id, nonNegativeInt(p.wins));
    lossesByPlayerId.set(id, nonNegativeInt(p.losses));
  }

  const built = buildEloApplyPayload(ratingMatchId, rpmRows, ratingByPlayerId);
  if (!built.ok) {
    redirect(`${path}?error=${encodeURIComponent(built.error)}`);
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
    redirect(`${path}?error=${encodeURIComponent(insLogErr.message)}`);
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
      redirect(`${path}?error=${encodeURIComponent(upErr.message)}`);
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
    redirect(`${path}?error=${encodeURIComponent(finErr.message)}`);
  }

  revalidatePath(path);
  redirect(`${path}?success=${encodeURIComponent("Elo procesado correctamente.")}`);
}
