import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

const rowLinkClass =
  "navbar-text btn-gold inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-4 py-2.5 text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:opacity-95 active:brightness-95 sm:min-w-[7.5rem]";

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
  court: number | null;
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

  const standingRankByTeamId = new Map<number, number>(
    ((standingsData ?? []) as StandingDbRow[])
      .slice()
      .sort(
        (a, b) =>
          b.points - a.points || b.buchholz - a.buchholz || b.games_difference - a.games_difference
      )
      .map((row, idx) => [row.team_id, idx + 1])
  );

  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, round_number, court, team1_id, team2_id, winner_team_id, team1_games, team2_games, status, finished")
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

  const teamOptions: ControlTeamOption[] = teams
    .map((t) => {
      const name = teamNameById.get(t.id) ?? `Team #${t.id}`;
      return {
        id: t.id,
        name,
        standingRank: standingRankByTeamId.get(t.id) ?? null,
      };
    })
    .sort((a, b) => {
      const rankA = a.standingRank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.standingRank ?? Number.MAX_SAFE_INTEGER;
      return rankA - rankB || a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <h1 className="logo text-2xl text-primary sm:text-3xl">{tournamentName} 
            
            </h1>
          
        </div>

        <div className="mb-6 flex justify-center sm:justify-start">
          <Link href={`/admin/tournaments/${slug}`} className={rowLinkClass}>
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-3.5 w-3.5" aria-hidden />
            Regresar
          </Link>
        </div>

        {uiError ? (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {uiError}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            {success}
          </p>
        ) : null}

        <StandingsTable rows={standings} title="Standings" />

        {roundNumbers.map((round) => {
          const roundMatches = (matchesByRound.get(round) ?? []).map(
            (m) =>
              ({
                id: m.id,
                court: m.court,
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
      </main>
    </div>
  );
}
