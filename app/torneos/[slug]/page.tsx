import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { RoundMatches, type RoundMatchesRound } from "@/components/tournaments/RoundMatches";
import { StandingsTable, type StandingsTableRow } from "@/components/tournaments/StandingsTable";

import {
  ALEPH_MATCHES_BY_ROUND,
  ALEPH_TOURNAMENT_SLUG,
} from "@/data/tournaments/aleph_padel_tournament";
import { formatTournamentFormatLabel } from "@/data/tournaments";
import { absoluteUrl } from "@/lib/site-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchTournamentBySlugFromSupabase } from "@/lib/tournaments/supabase-list";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

function asPlayer(
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchTournamentBySlugFromSupabase(slug);
  if (!result.ok) {
    return { title: "Torneo" };
  }
  const { tournament } = result;
  const description = `${tournament.name}: ${tournament.dateLabel}, ${tournament.timeLabel}. ${formatTournamentFormatLabel(tournament)}. ${tournament.playerCount} jugadores${tournament.minElo != null ? `. ELO mínimo ${tournament.minElo}` : ""}. Torneo Sportchain.`;
  return {
    title: tournament.name,
    description,
    openGraph: {
      title: tournament.name,
      description,
      url: `/torneos/${tournament.slug}`,
      locale: "es_ES",
      images: tournament.imageUrl ? [{ url: tournament.imageUrl, alt: tournament.name }] : undefined,
    },
    alternates: {
      canonical: absoluteUrl(`/torneos/${tournament.slug}`),
    },
  };
}

export default async function TournamentBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await fetchTournamentBySlugFromSupabase(slug);
  if (!result.ok) {
    notFound();
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

  const showAlephDetail = slug === ALEPH_TOURNAMENT_SLUG;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/torneos"
          className="navbar-text mb-6 inline-block border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-4 py-2 text-xs uppercase text-white transition hover:brightness-110"
        >
          ← Todos los torneos
        </Link>

        <h2 className="text-xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          {tournament.name}
        </h2>
        <StandingsTable rows={standingsRows} title="Standings" />

        <RoundMatches rounds={roundMatchesRounds} />

        <section className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <h2 className="navbar-text mb-3 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
              Jugadores inscritos
            </h2>
            <div className="overflow-x-auto border-2 border-[var(--color-primary)]">
              <table className="w-full min-w-[460px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                    <th className="px-2 py-1.5">#</th>
                    <th className="px-2 py-1.5">Jugador</th>
                    <th className="px-2 py-1.5">ELO</th>
                    <th className="px-2 py-1.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredPlayers.length === 0 ? (
                    <tr className="bg-[var(--color-surface)]">
                      <td colSpan={4} className="px-2 py-2 text-[var(--color-subtle-text)]">
                        Aun no hay jugadores registrados.
                      </td>
                    </tr>
                  ) : (
                    registeredPlayers.map((row, index) => {
                      const player = asPlayer(row.players);
                      return (
                        <tr
                          key={row.id}
                          className={
                            index % 2 === 0
                              ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/40"
                              : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                          }
                        >
                          <td className="px-2 py-1.5 font-mono tabular-nums">{index + 1}</td>
                          <td className="px-2 py-1.5">
                            {player ? `${player.name} ${player.lastname}` : `Player #${row.id}`}
                          </td>
                          <td className="px-2 py-1.5 font-mono tabular-nums">{player?.rating ?? "—"}</td>
                          <td className="px-2 py-1.5 uppercase text-[var(--color-subtle-text)]">
                            {row.status}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="navbar-text mb-3 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
              Equipos
            </h2>
            <div className="overflow-x-auto border-2 border-[var(--color-primary)]">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                    <th className="px-2 py-1.5">#</th>
                    <th className="px-2 py-1.5">Jugador 1</th>
                    <th className="px-2 py-1.5">Jugador 2</th>
                    <th className="px-2 py-1.5">Nombre de equipo</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.length === 0 ? (
                    <tr className="bg-[var(--color-surface)]">
                      <td colSpan={4} className="px-2 py-2 text-[var(--color-subtle-text)]">
                        Aun no hay equipos registrados.
                      </td>
                    </tr>
                  ) : (
                    teams.map((team, index) => {
                      const p1 = playersById.get(team.player1_id);
                      const p2 = playersById.get(team.player2_id);
                      return (
                        <tr
                          key={team.id}
                          className={
                            index % 2 === 0
                              ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/40"
                              : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                          }
                        >
                          <td className="px-2 py-1.5 font-mono tabular-nums">{index + 1}</td>
                          <td className="px-2 py-1.5">
                            {p1 ? `${p1.name} ${p1.lastname}` : `Player #${team.player1_id}`}
                          </td>
                          <td className="px-2 py-1.5">
                            {p2 ? `${p2.name} ${p2.lastname}` : `Player #${team.player2_id}`}
                          </td>
                          <td className="px-2 py-1.5">{team.team_name?.trim() || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {showAlephDetail ? (
          <>
            <section>
              <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
                Matches
              </h2>
              <div className="flex flex-col gap-8">
                {ALEPH_MATCHES_BY_ROUND.map((round) => (
                  <div key={round.round}>
                    <h3 className="mb-3 border-b-2 border-[var(--color-accent-gold)] pb-2 text-lg font-black uppercase text-[var(--color-primary)]">
                      {round.label}
                    </h3>
                    <ul className="flex flex-col gap-4">
                      {round.matches.map((m, idx) => (
                        <li
                          key={`${round.round}-${idx}`}
                          className="border-2 border-[var(--color-primary)] bg-[var(--color-muted)]/40 p-4 shadow-[4px_4px_0_rgba(0,0,0,0.12)]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[var(--color-primary)]">{m.team1.name}</p>
                              <p className="text-xs text-[var(--color-subtle-text)]">
                                {m.team1.players}
                              </p>
                            </div>
                            <div className="navbar-text flex shrink-0 items-center gap-1 text-xl tabular-nums text-[var(--color-primary)]">
                              <span>{m.score1}</span>
                              <span className="text-[var(--color-subtle-text)]">:</span>
                              <span>{m.score2}</span>
                            </div>
                            <div className="min-w-0 flex-1 text-right sm:text-right">
                              <p className="font-bold text-[var(--color-primary)]">{m.team2.name}</p>
                              <p className="text-xs text-[var(--color-subtle-text)]">
                                {m.team2.players}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <p className="text-sm text-[var(--color-subtle-text)]">
            Bracket and standings for this tournament will be published here.
          </p>
        )}
      </main>
    </div>
  );
}
