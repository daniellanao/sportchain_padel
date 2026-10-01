import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { RankingPlayersTable } from "@/components/ranking/RankingPlayersTable";
import { SportchainAbout } from "@/components/SportchainAbout";
import { fetchPlayersListFromSupabase } from "@/lib/ranking/supabase-players";

const description =
  "Ranking ELO de jugadores de pádel Sportchain: posición, partidos jugados y puntos. Consulta la clasificación y el historial de cada jugador.";

export const metadata: Metadata = {
  title: "Ranking",
  description,
  openGraph: {
    title: "Ranking ELO — Sportchain Padel",
    description,
    url: "/ranking",
    locale: "es_ES",
  },
  alternates: {
    canonical: "/ranking",
  },
};

export const revalidate = 60;

export default async function RankingPage() {
  const result = await fetchPlayersListFromSupabase();
  const players = result.players;

  let lastRating: number | null = null;
  let lastPosition = 0;
  const rankedPlayers = players.map((player, index) => {
    const rating = player.rating;
    if (lastRating === null || rating !== lastRating) {
      lastPosition = index + 1;
      lastRating = rating;
    }

    return { player, index, position: lastPosition };
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="flex h-[30svh] min-h-[13rem] items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
            Ranking ELO · Pádel
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
            Sube en el ranking
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-white/80 sm:text-base">
            Cada partido cuenta: compite en torneos, suma puntos ELO y mide tu nivel frente a otros jugadores.
          </p>
          <Link
            href="/ranking/calculo"
            className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.14em] text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
          >
            ¿Cómo se calcula?
          </Link>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!result.ok ? (
          <p className="rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        <RankingPlayersTable rankedPlayers={rankedPlayers} />
      </main>
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
        <SportchainAbout />
      </div>
    </div>
  );
}
