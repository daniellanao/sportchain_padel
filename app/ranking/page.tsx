import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
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

        {!result.ok ? (
          <p className="mt-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
          <table className="w-full table-fixed border-collapse text-left text-xs leading-tight">
            <thead>
              <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                <th className="navbar-text w-[10%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5 text-center">
                  #
                </th>
                <th className="navbar-text w-[40%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5">
                  Nombre
                </th>
                <th
                  className="navbar-text w-[10%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5 text-center"
                  title="Partidos jugados"
                >
                  Part.
                </th>
                <th
                  className="navbar-text w-[20%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5 text-center"
                  title="Puntos ELO"
                >
                  ELO
                </th>
                <th
                  className="navbar-text w-[20%] whitespace-nowrap px-2 py-1.5 text-[10px] uppercase sm:px-2.5"
                  title="Detalle del jugador"
                >
                  Det.
                </th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-[var(--color-muted)] bg-[var(--color-surface)] px-3 py-4 text-center text-xs text-[var(--color-subtle-text)] sm:px-4"
                  >
                    No hay jugadores en el ranking todavía.
                  </td>
                </tr>
              ) : (
                rankedPlayers.map(({ player, index, position }) => (
                  <tr
                    key={player.id}
                    className={
                      index % 2 === 0
                        ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                        : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                    }
                  >
                    <td className="w-[10%] px-2 py-1.5 font-mono tabular-nums text-[var(--color-primary)] sm:px-2.5 text-center">
                      {position}
                    </td>
                    <td className="w-[40%] truncate px-2 py-1.5 font-medium text-[var(--color-foreground)] sm:px-2.5">
                      {player.name} {player.lastname}
                    </td>
                    <td className="w-[10%] px-2 py-1.5 tabular-nums text-[var(--color-subtle-text)] sm:px-2.5 text-center">
                      {player.matches_played}
                    </td>
                    <td className="navbar-text w-[20%] px-2 py-1.5 tabular-nums text-[var(--color-primary)] sm:px-2.5 text-center">
                      {player.rating}
                    </td>
                    <td className="w-[20%] px-1.5 py-1 sm:px-2">
                      <Link
                        href={`/ranking/${player.id}`}
                        className="navbar-text btn-gold inline-flex min-h-[26px] items-center justify-center whitespace-nowrap border-2 border-[var(--color-accent-gold)] px-2 py-0.5 text-[9px] uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:brightness-105 sm:text-[10px]"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
