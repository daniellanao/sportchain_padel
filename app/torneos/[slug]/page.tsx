import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import {
  ALEPH_MATCHES_BY_ROUND,
  ALEPH_STANDINGS,
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

        <TournamentCard tournament={tournament} />

        <section className="mb-10">
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
        </section>

        {showAlephDetail ? (
          <>
            <section className="mb-10">
              <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
                Standings
              </h2>
              <div className="overflow-x-auto border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
                <table className="w-full min-w-[1100px] border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">#</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">Team</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">Players</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">R1</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">R2</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">R3</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">R4</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">MP</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">W</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">L</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">GW</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">GL</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">Diff</th>
                      <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">Wins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALEPH_STANDINGS.map((row, i) => (
                      <tr
                        key={`${row.teamName}-${row.rank}`}
                        className={
                          i % 2 === 0
                            ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                            : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                        }
                      >
                        <td className="px-2 py-2 font-mono tabular-nums text-[var(--color-primary)] sm:px-3">
                          {row.rank}
                        </td>
                        <td className="max-w-[140px] px-2 py-2 font-medium sm:px-3">{row.teamName}</td>
                        <td className="max-w-[200px] px-2 py-2 text-[var(--color-subtle-text)] sm:px-3">
                          {row.players}
                        </td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.r1 || "—"}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.r2 || "—"}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.r3 || "—"}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.r4 || "—"}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.mp}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.w}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.l}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.gw}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.gl}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.diff}</td>
                        <td className="px-2 py-2 tabular-nums sm:px-3">{row.wins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

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
