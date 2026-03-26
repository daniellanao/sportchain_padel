import { computeTeamEloDeltas } from "@/lib/rating/team-elo";

export type RpmEloRow = {
  player_id: number;
  side: number;
  role: number;
  is_winner: boolean;
};

export type EloLogInsert = {
  rating_match_id: number;
  player_id: number;
  rating_before: number;
  rating_after: number;
  rating_change: number;
};

export type EloPlayerUpdate = {
  id: number;
  ratingBefore: number;
  ratingAfter: number;
};

export type EloApplyPayload = {
  logRows: EloLogInsert[];
  playerUpdates: EloPlayerUpdate[];
};

/**
 * Validates structure for Elo: 4 rows, 2 per side, exactly two winners (same side) and two losers.
 */
export function validateRatingMatchPlayersForElo(rows: RpmEloRow[]): string | null {
  if (rows.length !== 4) {
    return "Se requieren exactamente 4 jugadores en rating_match_players.";
  }

  const side1 = rows.filter((r) => Number(r.side) === 1);
  const side2 = rows.filter((r) => Number(r.side) === 2);
  if (side1.length !== 2 || side2.length !== 2) {
    return "Debe haber 2 jugadores en el lado 1 y 2 en el lado 2.";
  }

  const winners = rows.filter((r) => r.is_winner);
  const losers = rows.filter((r) => !r.is_winner);
  if (winners.length !== 2 || losers.length !== 2) {
    return "Debe haber exactamente 2 ganadores y 2 perdedores.";
  }

  const winnerSides = new Set(winners.map((w) => Number(w.side)));
  if (winnerSides.size !== 1) {
    return "Los dos ganadores deben pertenecer al mismo lado.";
  }

  const loserSides = new Set(losers.map((w) => Number(w.side)));
  if (loserSides.size !== 1) {
    return "Los dos perdedores deben pertenecer al mismo lado.";
  }

  const winSide = [...winnerSides][0]!;
  const loseSide = [...loserSides][0]!;
  if (winSide === loseSide) {
    return "Ganadores y perdedores no pueden estar en el mismo lado.";
  }

  return null;
}

/**
 * Builds log rows and player rating updates from RPM rows and current player ratings.
 */
export function buildEloApplyPayload(
  ratingMatchId: number,
  rpmRows: RpmEloRow[],
  ratingByPlayerId: Map<number, number>
): { ok: true; payload: EloApplyPayload } | { ok: false; error: string } {
  const validationError = validateRatingMatchPlayersForElo(rpmRows);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  for (const r of rpmRows) {
    const pid = Number(r.player_id);
    if (!ratingByPlayerId.has(pid)) {
      return { ok: false, error: `No se encontró rating para el jugador ${pid}.` };
    }
  }

  const side1Rows = rpmRows.filter((r) => Number(r.side) === 1);
  const side2Rows = rpmRows.filter((r) => Number(r.side) === 2);
  const side1Wins = side1Rows.every((r) => r.is_winner);

  const r11 = Number(side1Rows[0]!.player_id);
  const r12 = Number(side1Rows[1]!.player_id);
  const r21 = Number(side2Rows[0]!.player_id);
  const r22 = Number(side2Rows[1]!.player_id);

  const team1Avg = (ratingByPlayerId.get(r11)! + ratingByPlayerId.get(r12)!) / 2;
  const team2Avg = (ratingByPlayerId.get(r21)! + ratingByPlayerId.get(r22)!) / 2;

  const { delta1, delta2 } = computeTeamEloDeltas(team1Avg, team2Avg, side1Wins);

  const logRows: EloLogInsert[] = [];
  const playerUpdates: EloPlayerUpdate[] = [];

  for (const r of rpmRows) {
    const pid = Number(r.player_id);
    const side = Number(r.side);
    const before = ratingByPlayerId.get(pid)!;
    const delta = side === 1 ? delta1 : delta2;
    const after = before + delta;
    logRows.push({
      rating_match_id: ratingMatchId,
      player_id: pid,
      rating_before: before,
      rating_after: after,
      rating_change: delta,
    });
    playerUpdates.push({ id: pid, ratingBefore: before, ratingAfter: after });
  }

  return { ok: true, payload: { logRows, playerUpdates } };
}
