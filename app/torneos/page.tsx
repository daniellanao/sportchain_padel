import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import {
  formatTournamentFormatLabel,
  PAST_TOURNAMENTS,
  UPCOMING_TOURNAMENTS,
} from "@/data/tournaments";

const description =
  "Browse upcoming and past padel tournaments. Swiss system draws, schedules, and event details — all in one place.";

export const metadata: Metadata = {
  title: "Tournaments",
  description,
  openGraph: {
    title: "Tournaments",
    description,
    url: "/tournaments",
  },
  alternates: {
    canonical: "/tournaments",
  },
};

export default function TournamentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          Torneos
        </h1>

        <section className="mb-10">
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Upcoming
          </h2>
          {UPCOMING_TOURNAMENTS.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">No upcoming tournaments.</p>
          ) : (
            <ul
              className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {UPCOMING_TOURNAMENTS.map((t) => (
                <li
                  key={t.slug}
                  data-slug={t.slug}
                  className="flex flex-col border-4 border-[var(--color-primary)] bg-[var(--color-muted)]/50 p-4 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-5"
                >
                  <Link href={`/torneos/${t.slug}`} className="group flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)]">
                    {t.imageUrl ? (
                      <div className="relative mb-3 aspect-[16/10] w-full shrink-0 overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-surface)]">
                        <Image
                          src={t.imageUrl}
                          alt={t.name}
                          fill
                          className="object-cover transition group-hover:brightness-95"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority
                        />
                      </div>
                    ) : null}
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <h3 className="min-w-0 flex-1 text-base font-black uppercase leading-tight text-[var(--color-primary)] group-hover:underline sm:text-lg">
                        {t.name}
                      </h3>
                      <span className="navbar-text shrink-0 border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-2 py-1 text-[10px] uppercase text-white">
                        Upcoming
                      </span>
                    </div>
                    {t.minElo != null ? (
                      <div
                        className="mb-3 border-4 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-3 py-4 text-center shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
                        role="status"
                        aria-label={`Minimum ELO required: ${t.minElo}`}
                      >
                        <p className="navbar-text text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent-gold)]">
                          Minimum ELO required
                        </p>
                        <p className="navbar-text mt-1 text-4xl font-black leading-none tabular-nums text-white sm:text-5xl">
                          {t.minElo}
                        </p>
                        <p className="mt-2 text-xs font-medium text-[rgba(232,236,245,0.9)]">
                          You need at least this rating to join
                        </p>
                      </div>
                    ) : null}
                    <p className="mb-3 font-mono text-[10px] leading-tight text-[var(--color-subtle-text)]">
                      {t.slug}
                    </p>
                    <dl className="grid flex-1 gap-2 text-sm grid-cols-1">
                      <div>
                        <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                          Date
                        </dt>
                        <dd className="mt-0.5 font-medium text-[var(--color-foreground)]">{t.dateLabel}</dd>
                      </div>
                      <div>
                        <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                          Start time
                        </dt>
                        <dd className="mt-0.5 font-medium text-[var(--color-foreground)]">{t.timeLabel}</dd>
                      </div>
                      <div>
                        <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                          Players
                        </dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-[var(--color-foreground)]">
                          {t.playerCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                          Format
                        </dt>
                        <dd className="mt-0.5 font-medium text-[var(--color-foreground)]">
                          {formatTournamentFormatLabel(t)}
                        </dd>
                      </div>
                    </dl>
                    <span className="navbar-text btn-gold mt-4 inline-flex min-h-[40px] w-full items-center justify-center border-2 border-[var(--color-accent-gold)] px-4 py-2 text-center text-xs uppercase">
                      View tournament
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Past
          </h2>
          {PAST_TOURNAMENTS.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">No past tournaments yet.</p>
          ) : (
            <ul
              className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {PAST_TOURNAMENTS.map((t) => (
                <li key={t.slug} data-slug={t.slug}>
                  <Link
                    href={`/tournaments/${t.slug}`}
                    className="block border-2 border-[var(--color-muted)] bg-[var(--color-surface)] px-4 py-3 text-sm transition hover:border-[var(--color-primary)]"
                  >
                    <span className="font-medium text-[var(--color-foreground)]">{t.name}</span>
                    <span className="text-[var(--color-subtle-text)]"> — {t.dateLabel}</span>
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-subtle-text)]">
                      {t.slug}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
