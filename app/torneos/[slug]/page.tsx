import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import {
  ALEPH_MATCHES_BY_ROUND,
  ALEPH_STANDINGS,
  ALEPH_TOURNAMENT_SLUG,
} from "@/data/tournaments/aleph_padel_tournament";
import {
  formatTournamentFormatLabel,
  getTournamentBySlug,
  PAST_TOURNAMENTS,
  UPCOMING_TOURNAMENTS,
} from "@/data/tournaments";
import { absoluteUrl } from "@/lib/site-config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [...UPCOMING_TOURNAMENTS, ...PAST_TOURNAMENTS].map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tournament = getTournamentBySlug(slug);
  if (!tournament) {
    return { title: "Tournament" };
  }
  const description = `${tournament.name} on ${tournament.dateLabel} at ${tournament.timeLabel}. ${formatTournamentFormatLabel(tournament)}. ${tournament.playerCount} players${tournament.minElo != null ? `. Min ELO ${tournament.minElo}` : ""}.`;
  return {
    title: tournament.name,
    description,
    openGraph: {
      title: tournament.name,
      description,
      url: `/tournaments/${tournament.slug}`,
      images: tournament.imageUrl ? [{ url: tournament.imageUrl, alt: tournament.name }] : undefined,
    },
    alternates: {
      canonical: absoluteUrl(`/tournaments/${tournament.slug}`),
    },
  };
}

export default async function TournamentBySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const tournament = getTournamentBySlug(slug);
  if (!tournament) {
    notFound();
  }

  const showAlephDetail = slug === ALEPH_TOURNAMENT_SLUG;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/tournaments"
          className="navbar-text mb-6 inline-block border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-4 py-2 text-xs uppercase text-white transition hover:brightness-110"
        >
          ← All tournaments
        </Link>

        <header className="mb-8 border-4 border-[var(--color-accent-gold)] bg-[var(--color-surface)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
            {tournament.imageUrl ? (
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-muted)] lg:max-w-md">
                <Image
                  src={tournament.imageUrl}
                  alt={tournament.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                  priority
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="navbar-text mb-1 text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">
                {tournament.status === "upcoming" ? "Upcoming" : tournament.status}
              </p>
              <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
                {tournament.name}
              </h1>
              <p className="mt-1 font-mono text-xs text-[var(--color-subtle-text)]">{tournament.slug}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">Date</dt>
                  <dd className="font-medium">{tournament.dateLabel}</dd>
                </div>
                <div>
                  <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                    Start time
                  </dt>
                  <dd className="font-medium">{tournament.timeLabel}</dd>
                </div>
                <div>
                  <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                    Players
                  </dt>
                  <dd className="font-medium tabular-nums">{tournament.playerCount}</dd>
                </div>
                <div>
                  <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                    Format
                  </dt>
                  <dd className="font-medium">{formatTournamentFormatLabel(tournament)}</dd>
                </div>
                {tournament.minElo != null ? (
                  <div>
                    <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                      Min ELO to join
                    </dt>
                    <dd className="font-medium tabular-nums">{tournament.minElo}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </header>

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
