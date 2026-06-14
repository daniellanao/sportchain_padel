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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          Ranking
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-subtle-text)]">
          <Link
            href="/ranking/calculo"
            className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            ¿Cómo se calcula?
          </Link>
        </p>

        {!result.ok ? (
          <p className="mt-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
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
