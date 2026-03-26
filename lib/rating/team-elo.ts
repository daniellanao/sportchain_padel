/** K-factor for team-vs-team Elo step. */
export const ELO_K = 32;

/**
 * Expected score for `teamRating` against `opponentRating` (classic Elo formula).
 * expected_team1 = 1 / (1 + 10 ^ ((team2_avg - team1_avg) / 400))
 */
export function expectedScore(teamRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - teamRating) / 400));
}

export type TeamEloComputation = {
  expected1: number;
  expected2: number;
  actual1: number;
  actual2: number;
  delta1: number;
  delta2: number;
};

/**
 * Team averages → expected scores, actual 1/0 per side, rounded side deltas with K = 32.
 */
export function computeTeamEloDeltas(
  team1Avg: number,
  team2Avg: number,
  side1Wins: boolean,
  k: number = ELO_K
): TeamEloComputation {
  const expected1 = expectedScore(team1Avg, team2Avg);
  const expected2 = expectedScore(team2Avg, team1Avg);
  const actual1 = side1Wins ? 1 : 0;
  const actual2 = side1Wins ? 0 : 1;
  const delta1 = Math.round(k * (actual1 - expected1));
  const delta2 = Math.round(k * (actual2 - expected2));
  return { expected1, expected2, actual1, actual2, delta1, delta2 };
}
