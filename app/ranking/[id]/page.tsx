import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { getRankingPlayerById, RANKING_PLAYERS } from "@/data/ranking";
import { getPlayerDisplay, getPlayerMatchHistory } from "@/data/ranking/playerHistory";
import { absoluteUrl } from "@/lib/site-config";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return RANKING_PLAYERS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const player = getRankingPlayerById(id);
  if (!player) {
    return { title: "Player" };
  }
  const name = `${player.firstName} ${player.lastName}`;
  const description = `Doubles match history (padel pairs) and individual ELO change for ${name}.`;
  return {
    title: name,
    description,
    openGraph: {
      title: `${name} — match history`,
      description,
      url: `/ranking/${player.id}`,
    },
    alternates: {
      canonical: absoluteUrl(`/ranking/${player.id}`),
    },
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function PlayerLink({ id, label }: { id: string; label: string }) {
  return (
    <Link
      href={`/ranking/${id}`}
      className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
    >
      {label}
    </Link>
  );
}

export default async function PlayerHistoryPage({ params }: PageProps) {
  const { id } = await params;
  const player = getRankingPlayerById(id);
  if (!player) {
    notFound();
  }

  const matches = getPlayerMatchHistory(id);
  const name = `${player.firstName} ${player.lastName}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/ranking"
          className="navbar-text mb-6 inline-block border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-4 py-2 text-xs uppercase text-white transition hover:brightness-110"
        >
          ← Back to ranking
        </Link>

        <header className="mb-8 border-4 border-[var(--color-accent-gold)] bg-[var(--color-surface)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-6">
          <p className="navbar-text mb-1 text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">
            Player #{player.id}
          </p>
          <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
            {name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-subtle-text)]">
            <strong className="text-[var(--color-foreground)]">Padel is doubles:</strong> each row
            lists <strong>your partner</strong> and <strong>both players on the other side</strong>.
            <strong className="text-[var(--color-foreground)]"> ELO is individual</strong> — your
            rating change is computed for you only, not for the pair as a unit.
          </p>
          <dl className="mt-4 flex flex-wrap gap-6 text-sm">
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                Current ELO (individual)
              </dt>
              <dd className="navbar-text text-lg tabular-nums text-[var(--color-primary)]">
                {player.points}
              </dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                Matches played
              </dt>
              <dd className="font-medium tabular-nums">{player.matchesPlayed}</dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                History rows
              </dt>
              <dd className="font-medium tabular-nums">{matches.length}</dd>
            </div>
          </dl>
        </header>

        <section>
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            All matches (pairs)
          </h2>
          {matches.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">
              No recorded matches for this player yet.
            </p>
          ) : (
            <div className="overflow-x-auto border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">#</th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">Date</th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">
                      You + partner
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">
                      Opponent pair
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">Result</th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">Score</th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">
                      ELO before
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">
                      ELO after
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, index) => {
                    const delta = m.ratingAfter - m.ratingBefore;
                    return (
                      <tr
                        key={m.matchId}
                        className={
                          index % 2 === 0
                            ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                            : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                        }
                      >
                        <td className="px-2 py-2 font-mono tabular-nums text-[var(--color-primary)] sm:px-3">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-[var(--color-foreground)] sm:px-3">
                          {formatDate(m.playedAt)}
                        </td>
                        <td className="min-w-[11rem] px-2 py-2 sm:px-3">
                          <div className="flex flex-col gap-1.5">
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">You</span>
                              <p className="font-semibold leading-tight text-[var(--color-foreground)]">{name}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">
                                Partner
                              </span>
                              <p className="leading-tight">
                                <PlayerLink id={m.partnerId} label={getPlayerDisplay(m.partnerId)} />
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="min-w-[11rem] px-2 py-2 sm:px-3">
                          <div className="flex flex-col gap-1.5">
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">
                                Opponent 1
                              </span>
                              <p className="leading-tight">
                                <PlayerLink id={m.opponentId1} label={getPlayerDisplay(m.opponentId1)} />
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">
                                Opponent 2
                              </span>
                              <p className="leading-tight">
                                <PlayerLink id={m.opponentId2} label={getPlayerDisplay(m.opponentId2)} />
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-3">
                          <span
                            className={
                              m.result === "win"
                                ? "font-bold text-emerald-700 dark:text-emerald-400"
                                : "font-bold text-rose-700 dark:text-rose-400"
                            }
                          >
                            {m.result === "win" ? "W" : "L"}
                          </span>
                        </td>
                        <td className="navbar-text whitespace-nowrap px-2 py-2 tabular-nums sm:px-3">
                          {m.playerGames} – {m.opponentGames}
                        </td>
                        <td className="px-2 py-2 tabular-nums text-[var(--color-subtle-text)] sm:px-3">
                          {m.ratingBefore}
                        </td>
                        <td className="navbar-text px-2 py-2 tabular-nums text-[var(--color-primary)] sm:px-3">
                          {m.ratingAfter}
                        </td>
                        <td
                          className={`px-2 py-2 tabular-nums sm:px-3 ${
                            delta >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
