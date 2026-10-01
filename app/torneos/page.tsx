import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { SportchainAbout } from "@/components/SportchainAbout";
import { TournamentCommunityCard } from "@/components/tournaments/TournamentCommunityCard";
import { TournamentUpcomingCard } from "@/components/tournaments/TournamentUpcomingCard";
import { fetchUpcomingOpenTournamentsForPublic } from "@/lib/open-tournaments/public-list";
import { fetchTournamentsListFromSupabase } from "@/lib/tournaments/supabase-list";

const description =
  "Torneos de pádel en Buenos Aires: próximos eventos Sportchain, torneos abiertos de la comunidad, histórico, horarios y requisitos ELO.";

export const metadata: Metadata = {
  title: "Torneos",
  description,
  openGraph: {
    title: "Torneos de pádel — Sportchain",
    description,
    url: "/torneos",
    locale: "es_ES",
  },
  alternates: {
    canonical: "/torneos",
  },
};

export const revalidate = 60;

export default async function TournamentsPage() {
  const [result, openCommunity] = await Promise.all([
    fetchTournamentsListFromSupabase(),
    fetchUpcomingOpenTournamentsForPublic(),
  ]);
  const { upcoming, past } = result;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="flex h-[30svh] min-h-[13rem] items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
            Torneos de pádel · Buenos Aires
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
            Encuentra tu torneo
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-white/80 sm:text-base">
            Todos los torneos de pádel de Buenos Aires en un solo lugar: inscríbete, compite y suma puntos a tu ranking.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="featured-tournament-title"
        className="relative isolate w-full overflow-hidden"
      >
        <Image
          src="/torneos/torneo_sportchain_ourbit.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-black/70" aria-hidden />

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[#E3C273]">
            Próximo torneo
          </p>
          <h2
            id="featured-tournament-title"
            className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl"
          >
            Torneo de Pádel
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Torneo de pádel para la comunidad de StartUps, Tech y Web3.
          </p>

          <dl className="flex flex-wrap gap-x-10 gap-y-3 border-y border-white/15 py-4 sm:max-w-md">
            <div>
              <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/60">Fecha</dt>
              <dd className="mt-1 text-base font-bold text-white">25 de octubre de 2026</dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/60">Hora</dt>
              <dd className="mt-1 text-base font-bold tabular-nums text-white">10:00</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="https://luma.com/env6mvi7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#E3C273] px-8 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#E3C273]/90"
            >
              Inscribirse
            </a>
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-white/60">
              Sponsored by <span className="font-bold text-white">Ourbit</span>
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {!result.ok ? (
          <p className="mb-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}
        {!openCommunity.ok ? (
          <p className="mb-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {openCommunity.error}
          </p>
        ) : null}

        <section className="mb-10">
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Próximos torneos Sportchain
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">No hay torneos próximos.</p>
          ) : (
            <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2" role="list">
              {upcoming.map((t) => (
                <TournamentUpcomingCard key={t.slug} tournament={t} />
              ))}
            </ul>
          )}
        </section>

        <section className="mb-10">
          <h2 className="navbar-text mb-1 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Torneos abiertos organizados por la comunidad
          </h2>
          <p className="mb-4 text-sm text-[color:var(--color-subtle-text)]">
            Torneos abiertos organizados por la comunidad; validos para sumar puntos a tu ranking.
          </p>
          {openCommunity.upcoming.length === 0 ? (
            <p className="text-sm text-[color:var(--color-subtle-text)]">No hay eventos en esta lista.</p>
          ) : (
            <ul
              className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              role="list"
            >
              {openCommunity.upcoming.map((t) => (
                <TournamentCommunityCard key={t.id} tournament={t} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Pasados
          </h2>
          {past.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">Aún no hay torneos finalizados.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#12305D]/15">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="whitespace-nowrap px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Fecha
                    </th>
                    <th className="px-3 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">Título</th>
                    <th className="w-px whitespace-nowrap px-3 py-2 text-right text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((t) => (
                    <tr
                      key={t.slug}
                      className="border-t border-[#12305D]/10 bg-[var(--color-surface)] even:bg-[var(--color-muted)]/50"
                    >
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-[var(--color-subtle-text)]">
                        {t.dateLabel}
                      </td>
                      <td className="px-3 py-2 font-semibold text-[var(--color-primary)]">{t.name}</td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-right">
                        <Link
                          href={`/torneos/${t.slug}`}
                          className="inline-flex items-center rounded-md border border-[#12305D]/30 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--color-primary)] transition hover:border-[#12305D] hover:bg-[#12305D] hover:text-white"
                        >
                          Detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
        <SportchainAbout />
      </div>
    </div>
  );
}
