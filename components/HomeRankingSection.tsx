import Link from "next/link";

import { fetchPlayersListFromSupabase } from "@/lib/ranking/supabase-players";

/**
 * Bloque “Top 10” de la home: misma lógica de posiciones (empates en ELO) que antes en Hero.
 */
export async function HomeRankingSection() {
  const result = await fetchPlayersListFromSupabase();
  const players = result.players;

  let lastRating: number | null = null;
  let lastPosition = 0;
  const ranked = players.map((player, index) => {
    const rating = player.rating;
    if (lastRating === null || rating !== lastRating) {
      lastPosition = index + 1;
      lastRating = rating;
    }
    return { player, position: lastPosition };
  });
  const top10 = ranked.slice(0, 10);

  return (
    <section
      className="border-t border-foreground/10 bg-[var(--color-muted)]/30 py-12 sm:py-16"
      aria-labelledby="home-ranking-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="home-ranking-heading"
            className="navbar-text text-xl uppercase tracking-[0.08em] text-[var(--color-primary)] sm:text-2xl"
          >
            Ranking
          </h2>
          <p className="text-sm text-[color:var(--color-subtle-text)]">Top 10</p>
        </div>

        <div className="overflow-hidden rounded-xl border-2 border-[var(--color-primary)]/20 bg-[var(--color-surface)] shadow-sm">
          {!result.ok ? (
            <p className="px-4 py-8 text-center text-sm text-[color:var(--color-subtle-text)]">{result.error}</p>
          ) : top10.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[color:var(--color-subtle-text)]">
              Aún no hay jugadores en el ranking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] table-fixed border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--color-primary)]/25 bg-[var(--color-muted)]/50">
                    <th className="navbar-text w-[14%] px-3 py-3 text-xs uppercase text-[var(--color-primary)] sm:px-4">
                      Pos.
                    </th>
                    <th className="navbar-text px-3 py-3 text-xs uppercase text-[var(--color-primary)] sm:px-4">
                      Nombre
                    </th>
                    <th className="navbar-text w-[22%] px-3 py-3 text-right text-xs uppercase text-[var(--color-primary)] sm:px-4">
                      Puntos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map(({ player, position }, index) => (
                    <tr
                      key={player.id}
                      className={
                        index % 2 === 0
                          ? "border-b border-foreground/10 bg-[var(--color-muted)]/25"
                          : "border-b border-foreground/10 bg-transparent"
                      }
                    >
                      <td className="px-3 py-2.5 font-mono tabular-nums text-[var(--color-primary)] sm:px-4">
                        {position}
                      </td>
                      <td className="truncate px-3 py-2.5 font-medium text-foreground sm:px-4">
                        <Link
                          href={`/ranking/${player.id}`}
                          className="text-foreground underline-offset-2 hover:text-[var(--color-primary)] hover:underline"
                        >
                          {player.name} {player.lastname}
                        </Link>
                      </td>
                      <td className="navbar-text px-3 py-2.5 text-right tabular-nums text-[var(--color-primary)] sm:px-4">
                        {player.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-foreground/10 px-4 py-4 text-center">
            <Link
              href="/ranking"
              className="navbar-text inline-block text-xs uppercase tracking-wide text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              Ver ranking completo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
