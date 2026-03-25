import type { RoundMatchesRound } from "@/components/tournaments/RoundMatches";
import type { StandingsTableRow } from "@/components/tournaments/StandingsTable";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tournament } from "@/data/tournaments";
import { fetchTournamentBySlugFromSupabase } from "@/lib/tournaments/supabase-list";

type TournamentRegisteredPlayer = {
  id: number;
  status: string;
  players:
    | {
        id: number;
        name: string;
        lastname: string;
        rating: number;
      }
    | {
        id: number;
        name: string;
        lastname: string;
        rating: number;
      }[]
    | null;
};

type TournamentTeam = {
  id: number;
  player1_id: number;
  player2_id: number;
  team_name: string | null;
};

type BasicPlayer = {
  id: number;
  name: string;
  lastname: string;
};

type StandingDbRow = {
  id: number;
  team_id: number;
  points: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  games_won: number;
  games_lost: number;
  games_difference: number;
  buchholz: number;
};

type MatchDbRow = {
  id: number;
  round_number: number;
  team1_id: number | null;
  team2_id: number | null;
  team1_games: number;
  team2_games: number;
  status: string;
  finished: boolean;
};

export function asPlayer(
  value: TournamentRegisteredPlayer["players"]
):
  | {
      id: number;
      name: string;
      lastname: string;
      rating: number;
    }
  | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type TournamentPageData = {
  tournament: Tournament;
  tournamentId: number;
  registeredPlayers: TournamentRegisteredPlayer[];
  teams: TournamentTeam[];
  playersById: Map<number, BasicPlayer>;
  standingsRows: StandingsTableRow[];
  roundMatchesRounds: RoundMatchesRound[];
};

export type TournamentPageDataResult =
  | { ok: true; data: TournamentPageData }
  | { ok: false; notFound: true };

/**
 * Loads tournament, standings, rounds/matches, teams and registered players (same sources as `/torneos/[slug]`).
 */
export async function fetchTournamentPageData(slug: string): Promise<TournamentPageDataResult> {
  const result = await fetchTournamentBySlugFromSupabase(slug);
  if (!result.ok) {
    return { ok: false, notFound: true };
  }

  const { tournament } = result;
  const tournamentId = Number(tournament.id);

  let registeredPlayers: TournamentRegisteredPlayer[] = [];
  let teams: TournamentTeam[] = [];
  let playersById = new Map<number, BasicPlayer>();
  let standingsRows: StandingsTableRow[] = [];
  let roundMatchesRounds: RoundMatchesRound[] = Array.from({ length: 4 }, (_, i) => ({
    roundNumber: i + 1,
    label: `Ronda ${i + 1}`,
    matches: [],
  }));

  if (Number.isInteger(tournamentId) && tournamentId > 0) {
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("player_tournament")
        .select("id, status, players(id, name, lastname, rating)")
        .eq("tournament_id", tournamentId)
        .order("created_at", { ascending: true });
      registeredPlayers = (data ?? []) as TournamentRegisteredPlayer[];
      registeredPlayers.sort((a, b) => {
        const aPlayer = asPlayer(a.players);
        const bPlayer = asPlayer(b.players);
        const aRating = aPlayer?.rating ?? -Infinity;
        const bRating = bPlayer?.rating ?? -Infinity;
        if (aRating !== bRating) return bRating - aRating;

        const aName = `${aPlayer?.name ?? ""} ${aPlayer?.lastname ?? ""}`.trim().toLowerCase();
        const bName = `${bPlayer?.name ?? ""} ${bPlayer?.lastname ?? ""}`.trim().toLowerCase();
        return aName.localeCompare(bName, "es");
      });

      const { data: teamsData } = await supabase
        .from("teams")
        .select("id, player1_id, player2_id, team_name")
        .eq("tournament_id", tournamentId)
        .order("id", { ascending: true });
      teams = (teamsData ?? []) as TournamentTeam[];

      const playerIds = Array.from(
        new Set(
          teams.flatMap((t) => [t.player1_id, t.player2_id]).filter((id) => Number.isInteger(id) && id > 0)
        )
      );
      if (playerIds.length > 0) {
        const { data: playersData } = await supabase
          .from("players")
          .select("id, name, lastname")
          .in("id", playerIds);
        const players = (playersData ?? []) as BasicPlayer[];
        playersById = new Map(players.map((p) => [p.id, p]));
      }

      const { data: standingsData } = await supabase
        .from("standings")
        .select(
          "id, team_id, points, matches_played, matches_won, matches_lost, games_won, games_lost, games_difference, buchholz"
        )
        .eq("tournament_id", tournamentId);
      const rawStandings = (standingsData ?? []) as StandingDbRow[];

      const teamNameById = new Map<number, string>(
        teams.map((team) => {
          const p1 = playersById.get(team.player1_id);
          const p2 = playersById.get(team.player2_id);
          const fallback = `${p1 ? `${p1.name} ${p1.lastname}` : `Player #${team.player1_id}`} / ${p2 ? `${p2.name} ${p2.lastname}` : `Player #${team.player2_id}`}`;
          return [team.id, team.team_name?.trim() || fallback];
        })
      );

      standingsRows = rawStandings
        .map((row) => ({
          teamName: teamNameById.get(row.team_id) || `Team #${row.team_id}`,
          points: row.points,
          matchesPlayed: row.matches_played,
          matchesWon: row.matches_won,
          matchesLost: row.matches_lost,
          gamesWon: row.games_won,
          gamesLost: row.games_lost,
          gamesDifference: row.games_difference,
          buchholz: row.buchholz,
        }))
        .sort((a, b) => {
          if (a.points !== b.points) return b.points - a.points;
          if (a.buchholz !== b.buchholz) return b.buchholz - a.buchholz;
          return b.gamesDifference - a.gamesDifference;
        })
        .map((row, idx) => ({ ...row, rank: idx + 1 }));

      const { data: matchesData } = await supabase
        .from("matches")
        .select(
          "id, round_number, team1_id, team2_id, team1_games, team2_games, status, finished"
        )
        .eq("tournament_id", tournamentId)
        .order("round_number", { ascending: true })
        .order("id", { ascending: true });

      const rawMatches = (matchesData ?? []) as MatchDbRow[];
      const matchesByRound = new Map<number, MatchDbRow[]>();
      for (const m of rawMatches) {
        const r = m.round_number;
        if (!matchesByRound.has(r)) matchesByRound.set(r, []);
        matchesByRound.get(r)!.push(m);
      }

      roundMatchesRounds = [1, 2, 3, 4].map((rn) => ({
        roundNumber: rn,
        label: `Ronda ${rn}`,
        matches: (matchesByRound.get(rn) ?? []).map((m) => ({
          id: m.id,
          team1Name:
            m.team1_id != null ? teamNameById.get(m.team1_id) ?? `Team #${m.team1_id}` : "—",
          team2Name:
            m.team2_id != null ? teamNameById.get(m.team2_id) ?? `Team #${m.team2_id}` : "—",
          team1Games: m.team1_games,
          team2Games: m.team2_games,
          status: m.status,
          finished: m.finished,
        })),
      }));
    }
  }

  return {
    ok: true,
    data: {
      tournament,
      tournamentId,
      registeredPlayers,
      teams,
      playersById,
      standingsRows,
      roundMatchesRounds,
    },
  };
}
