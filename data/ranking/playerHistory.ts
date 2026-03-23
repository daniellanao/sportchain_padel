/**
 * Historical match rows per player (dummy data).
 * Padel is doubles: each row stores your partner + both opponents; ELO is still per player.
 * Full history for player id "1" (Carlos Ruiz); others return [] until filled.
 */

import { RANKING_PLAYERS } from "../ranking";

export type HistoricalMatch = {
  matchId: string;
  /** ISO date */
  playedAt: string;
  /** Your doubles partner for this match */
  partnerId: string;
  /** Opposing pair — first player */
  opponentId1: string;
  /** Opposing pair — second player */
  opponentId2: string;
  result: "win" | "loss";
  /** Simplified games score (e.g. 6–4) for your pair vs the other pair */
  playerGames: number;
  opponentGames: number;
  ratingBefore: number;
  ratingAfter: number;
};

function playerNameById(id: string): string {
  const p = RANKING_PLAYERS.find((x) => x.id === id);
  return p ? `${p.firstName} ${p.lastName}` : `Player #${id}`;
}

export function getPlayerDisplay(playerId: string): string {
  return playerNameById(playerId);
}

/** @deprecated use getPlayerDisplay */
export function getOpponentDisplay(playerId: string): string {
  return getPlayerDisplay(playerId);
}

/** Deterministic pseudo-random 0..99 from index */
function noise(i: number): number {
  return (i * 7919 + 104729) % 100;
}

/** Pick partner + two distinct opponents (all ≠ focalId, all mutually distinct) */
function pickDoublesSides(
  focalId: string,
  i: number,
): { partnerId: string; opponentId1: string; opponentId2: string } {
  const pool = RANKING_PLAYERS.map((p) => p.id).filter((id) => id !== focalId);
  const used = new Set<string>();

  const take = (seed: number): string => {
    let idx = Math.abs(seed) % pool.length;
    let guard = 0;
    while (used.has(pool[idx]!) && guard < pool.length + 2) {
      idx = (idx + 1) % pool.length;
      guard++;
    }
    const id = pool[idx]!;
    used.add(id);
    return id;
  };

  return {
    partnerId: take(i * 7 + 3),
    opponentId1: take(i * 11 + 5),
    opponentId2: take(i * 13 + 9),
  };
}

/**
 * Build 48 matches for player "1", ending at `targetRating` (matches leaderboard points).
 */
function buildHistoryPlayer1(targetRating: number): HistoricalMatch[] {
  const focalId = "1";
  const target = RANKING_PLAYERS.find((p) => p.id === focalId);
  const n = target?.matchesPlayed ?? 48;

  const rows: HistoricalMatch[] = [];
  let ratingAfter = targetRating;

  for (let i = n - 1; i >= 0; i--) {
    const { partnerId, opponentId1, opponentId2 } = pickDoublesSides(focalId, i);
    const win = noise(i + focalId.length) < 58;
    const pGames = win ? 6 : 2 + (i % 4);
    const oGames = win ? 1 + (i % 4) : 6;
    const deltaMag = 5 + (noise(i * 3) % 12);
    const delta = win ? deltaMag : -deltaMag;
    const ratingBefore = Math.round(ratingAfter - delta);
    rows.unshift({
      matchId: `p${focalId}-m${i + 1}`,
      playedAt: dateForMatchIndex(i),
      partnerId,
      opponentId1,
      opponentId2,
      result: win ? "win" : "loss",
      playerGames: pGames,
      opponentGames: oGames,
      ratingBefore,
      ratingAfter: Math.round(ratingAfter),
    });
    ratingAfter = ratingBefore;
  }

  return rows;
}

/** Spread matches from Aug 2024 ~ weekly */
function dateForMatchIndex(i: number): string {
  const start = new Date(Date.UTC(2024, 7, 3));
  start.setUTCDate(start.getUTCDate() + i * 5 + (i % 3));
  return start.toISOString().slice(0, 10);
}

const HISTORY_BY_PLAYER: Record<string, HistoricalMatch[]> = {
  "1": (() => {
    const p = RANKING_PLAYERS.find((x) => x.id === "1");
    return buildHistoryPlayer1(p?.points ?? 1592);
  })(),
};

export function getPlayerMatchHistory(playerId: string): HistoricalMatch[] {
  return HISTORY_BY_PLAYER[playerId] ?? [];
}

export function hasPlayerHistory(playerId: string): boolean {
  return (HISTORY_BY_PLAYER[playerId]?.length ?? 0) > 0;
}
