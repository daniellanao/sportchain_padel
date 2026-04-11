import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { updateMatchControlAction } from "@/app/admin/tournaments/[slug]/control/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import {
  MatchesControlTable,
  type ControlMatchRow,
  type ControlTeamOption,
} from "@/components/admin/MatchesControlTable";
import { StandingsTable, type StandingsTableRow } from "@/components/tournaments/StandingsTable";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Control torneo",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type TeamRow = {
  id: number;
  team_name: string | null;
  player1_id: number;
  player2_id: number;
};

type StandingDbRow = {
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
  winner_team_id: number | null;
  team1_games: number;
  team2_games: number;
  status: string;
  finished: boolean;
};

type PlayerRow = { id: number; name: string; lastname: string };

function toTeamName(team: TeamRow, playersById: Map<number, PlayerRow>): string {
  if (team.team_name?.trim()) return team.team_name.trim();
  const p1 = playersById.get(team.player1_id);
  const p2 = playersById.get(team.player2_id);
  const n1 = p1 ? `${p1.name} ${p1.lastname}` : `Player #${team.player1_id}`;
  const n2 = p2 ? `${p2.name} ${p2.lastname}` : `Player #${team.player2_id}`;
  return `${n1} / ${n2}`;
}

export default async function AdminTournamentControlPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { slug } = await params;
  const { error: uiError, success } = await searchParams;

  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: tournamentData, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (tournamentError || !tournamentData) notFound();

  const tournamentId = Number((tournamentData as { id: number }).id);
  const tournamentName = String((tournamentData as { name: string }).name);

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, team_name, player1_id, player2_id")
    .eq("tournament_id", tournamentId)
    .order("id", { ascending: true });
  const teams = (teamsData ?? []) as TeamRow[];

  const playerIds = Array.from(
    new Set(teams.flatMap((t) => [t.player1_id, t.player2_id]).filter((id) => Number.isInteger(id) && id > 0))
  );
  let playersById = new Map<number, PlayerRow>();
  if (playerIds.length > 0) {
    const { data: playersData } = await supabase.from("players").select("id, name, lastname").in("id", playerIds);
    const players = (playersData ?? []) as PlayerRow[];
    playersById = new Map(players.map((p) => [p.id, p]));
  }

  const teamNameById = new Map<number, string>(teams.map((t) => [t.id, toTeamName(t, playersById)]));

  const { data: standingsData } = await supabase
    .from("standings")
    .select(
      "team_id, points, matches_played, matches_won, matches_lost, games_won, games_lost, games_difference, buchholz"
    )
    .eq("tournament_id", tournamentId);
  const standings = ((standingsData ?? []) as StandingDbRow[])
    .map((s) => ({
      rank: 0,
      teamName: teamNameById.get(s.team_id) ?? `Team #${s.team_id}`,
      points: s.points,
      matchesPlayed: s.matches_played,
      matchesWon: s.matches_won,
      matchesLost: s.matches_lost,
      gamesWon: s.games_won,
      gamesLost: s.games_lost,
      gamesDifference: s.games_difference,
      buchholz: s.buchholz,
    }))
    .sort((a, b) => b.points - a.points || b.buchholz - a.buchholz || b.gamesDifference - a.gamesDifference)
    .map((row, idx) => ({ ...row, rank: idx + 1 } satisfies StandingsTableRow));

  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, round_number, team1_id, team2_id, winner_team_id, team1_games, team2_games, status, finished")
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true })
    .order("id", { ascending: true });
  const matches = (matchesData ?? []) as MatchDbRow[];

  const matchesByRound = new Map<number, MatchDbRow[]>();
  for (const m of matches) {
    if (!matchesByRound.has(m.round_number)) matchesByRound.set(m.round_number, []);
    matchesByRound.get(m.round_number)!.push(m);
  }
  const roundNumbers = [...matchesByRound.keys()].sort((a, b) => a - b);

  const teamOptions: ControlTeamOption[] = teams.map((t) => ({
    id: t.id,
    name: teamNameById.get(t.id) ?? `Team #${t.id}`,
  }));

  return (
    <div className="flex w-full min-w-0 flex-col">
      <AdminNavbar />

      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-12 pt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="logo text-xl text-primary">{tournamentName}</h1>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              href={`/admin/tournaments/${slug}`}
              className="inline-flex items-center justify-center rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-muted"
            >
              Regresar al Detalle
            </Link>
          </div>
        </div>

        {uiError ? (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {uiError}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {success}
          </p>
        ) : null}

        <StandingsTable rows={standings} title="Standings" />

        {roundNumbers.map((round) => {
          const roundMatches = (matchesByRound.get(round) ?? []).map(
            (m) =>
              ({
                id: m.id,
                team1Id: m.team1_id,
                team2Id: m.team2_id,
                winnerTeamId: m.winner_team_id,
                team1Games: m.team1_games,
                team2Games: m.team2_games,
                finished: m.finished,
              }) satisfies ControlMatchRow
          );
          return (
            <MatchesControlTable
              key={round}
              roundNumber={round}
              slug={slug}
              teams={teamOptions}
              matches={roundMatches}
              updateAction={updateMatchControlAction}
            />
          );
        })}
      </div>
    </div>
  );
}
