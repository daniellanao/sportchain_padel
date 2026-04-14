import type { Metadata } from "next";

import { Navbar } from "@/components/Navbar";
import { SportchainAbout } from "@/components/SportchainAbout";
import { TournamentCommunityCard } from "@/components/tournaments/TournamentCommunityCard";
import { TournamentPastCard } from "@/components/tournaments/TournamentPastCard";
import { TournamentUpcomingCard } from "@/components/tournaments/TournamentUpcomingCard";
import { COMMUNITY_UPCOMING_TOURNAMENTS } from "@/data/tournaments";
import { fetchTournamentsListFromSupabase } from "@/lib/tournaments/supabase-list";

const description =
  "Torneos de pádel Sportchain: próximos eventos, histórico, formato suizo, horarios y requisitos ELO. Consulta la información oficial de cada torneo.";

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
  const result = await fetchTournamentsListFromSupabase();
  const { upcoming, past } = result;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          Torneos
        </h1>

        

        {!result.ok ? (
          <p className="mt-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        <section className="mb-10">
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Próximos torneos Sportchain
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">No hay torneos próximos.</p>
          ) : (
            <ul
              className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
              role="list"
            >
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
          {COMMUNITY_UPCOMING_TOURNAMENTS.length === 0 ? (
            <p className="text-sm text-[color:var(--color-subtle-text)]">No hay eventos en esta lista.</p>
          ) : (
            <ul
              className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
              role="list"
            >
              {COMMUNITY_UPCOMING_TOURNAMENTS.map((t) => (
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
            <ul
              className="grid list-none grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              role="list"
            >
              {past.map((t) => (
                <TournamentPastCard key={t.slug} tournament={t} />
              ))}
            </ul>
          )}
        </section>
      </main>

      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
        <SportchainAbout />
      </div>
    </div>
  );
}
