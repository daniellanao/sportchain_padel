import type { Metadata } from "next";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedinIn, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { RoundMatches } from "@/components/tournaments/RoundMatches";
import { StandingsTable } from "@/components/tournaments/StandingsTable";


import { formatTournamentFormatLabel } from "@/data/tournaments";
import { absoluteUrl } from "@/lib/site-config";
import { fetchTournamentPageData, asPlayer } from "@/lib/tournaments/tournament-page-data";
import { fetchTournamentBySlugFromSupabase } from "@/lib/tournaments/supabase-list";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeHandle(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  return v || null;
}

function PlayerNameWithStarsBadge({
  name,
  lastname,
  stars,
}: {
  name: string;
  lastname: string;
  stars: number | null;
}) {
  return (
    <span>
      {name} {lastname}
      {stars != null && stars > 0 ? (
        <span className="ml-1.5 inline-flex translate-y-[1px] items-center align-middle">
          <span className="relative inline-flex h-4 w-4 items-center justify-center text-[var(--color-primary)]">
            <FontAwesomeIcon icon={faStar} className="h-4 w-4" aria-hidden />
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none text-white">
              {stars}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );
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
  const loaded = await fetchTournamentPageData(slug);
  if (!loaded.ok) {
    notFound();
  }
  const { tournament, registeredPlayers, teams, playersById, standingsRows, roundMatchesRounds } =
    loaded.data;

  
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
              <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                    <th className="px-2 py-1.5">#</th>
                    <th className="px-2 py-1.5">Jugador</th>
                    <th className="px-2 py-1.5 text-center">Redes</th>
                    <th className="px-2 py-1.5">ELO</th>
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
                            {player ? (
                              <PlayerNameWithStarsBadge
                                name={player.name}
                                lastname={player.lastname}
                                stars={player.stars}
                              />
                            ) : (
                              `Player #${row.id}`
                            )}
                          </td>
                          
                          <td className="px-2 py-1.5 text-center align-middle">
                            <div className="inline-flex items-center gap-1.5">
                              {normalizeHandle(player?.linkedin) ? (
                                <a
                                  href={`https://www.linkedin.com/in/${normalizeHandle(player?.linkedin)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`LinkedIn de ${player ? `${player.name} ${player.lastname}` : "jugador"}`}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-primary)]/25 text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/8"
                                >
                                  <FontAwesomeIcon icon={faLinkedinIn} className="h-3.5 w-3.5" aria-hidden />
                                </a>
                              ) : null}
                              {normalizeHandle(player?.instagram) ? (
                                <a
                                  href={`https://www.instagram.com/${normalizeHandle(player?.instagram)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Instagram de ${player ? `${player.name} ${player.lastname}` : "jugador"}`}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-primary)]/25 text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/8"
                                >
                                  <FontAwesomeIcon icon={faInstagram} className="h-3.5 w-3.5" aria-hidden />
                                </a>
                              ) : null}
                              {normalizeHandle(player?.x_twitter) ? (
                                <a
                                  href={`https://x.com/${normalizeHandle(player?.x_twitter)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`X de ${player ? `${player.name} ${player.lastname}` : "jugador"}`}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-primary)]/25 text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/8"
                                >
                                  <FontAwesomeIcon icon={faXTwitter} className="h-3.5 w-3.5" aria-hidden />
                                </a>
                              ) : null}
                              {!normalizeHandle(player?.linkedin) &&
                              !normalizeHandle(player?.instagram) &&
                              !normalizeHandle(player?.x_twitter) ? (
                                <span className="text-[var(--color-subtle-text)]">—</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-2 py-1.5 font-mono tabular-nums">{player?.rating ?? "—"}</td>
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
                            {p1 ? (
                              <PlayerNameWithStarsBadge
                                name={p1.name}
                                lastname={p1.lastname}
                                stars={p1.stars}
                              />
                            ) : (
                              `Player #${team.player1_id}`
                            )}
                          </td>
                          <td className="px-2 py-1.5">
                            {p2 ? (
                              <PlayerNameWithStarsBadge
                                name={p2.name}
                                lastname={p2.lastname}
                                stars={p2.stars}
                              />
                            ) : (
                              `Player #${team.player2_id}`
                            )}
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

       
      </main>
    </div>
  );
}
