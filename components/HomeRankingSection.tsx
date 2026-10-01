import Link from "next/link";

import { fetchPlayersListFromSupabase } from "@/lib/ranking/supabase-players";

/** Home: top 10 del ranking ELO (empates en ELO comparten posición). */
export async function HomeRankingSection() {
  const result = await fetchPlayersListFromSupabase();

  let lastRating: number | null = null;
  let lastPosition = 0;
  const top10 = result.players.slice(0, 10).map((player, index) => {
    if (lastRating === null || player.rating !== lastRating) {
      lastPosition = index + 1;
      lastRating = player.rating;
    }
    return { player, position: lastPosition };
  });

  return (
    <section aria-labelledby="home-ranking-heading" className="bg-[var(--color-muted)]/50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--color-subtle-text)]">
              Ranking ELO · Pádel
            </p>
            <h2
              id="home-ranking-heading"
              className="mt-1 text-xl font-extrabold uppercase tracking-tight text-black sm:text-2xl"
            >
              Top 10 del ranking
            </h2>
          </div>
          <Link
            href="/ranking"
            className="inline-flex min-h-10 items-center self-start rounded-md border border-black/25 px-4 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black hover:bg-black hover:text-white sm:self-auto"
          >
            Ver ranking completo
          </Link>
        </div>

        {!result.ok ? (
          <p className="rounded-lg border border-black/10 bg-[var(--color-surface)] px-4 py-6 text-center text-sm text-[var(--color-subtle-text)]">
            {result.error}
          </p>
        ) : top10.length === 0 ? (
          <p className="text-sm text-[var(--color-subtle-text)]">Aún no hay jugadores en el ranking.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-black/10 shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="w-16 px-3 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-4">
                    Pos
                  </th>
                  <th className="px-3 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-4">
                    Jugador
                  </th>
                  <th className="hidden w-20 px-3 py-3 text-right text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:table-cell sm:px-4">
                    PJ
                  </th>
                  <th className="w-20 px-3 py-3 text-right text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-4">
                    ELO
                  </th>
                </tr>
              </thead>
              <tbody>
                {top10.map(({ player, position }) => (
                  <tr
                    key={player.id}
                    className="border-t border-black/5 bg-[var(--color-surface)] transition-colors even:bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)]"
                  >
                    <td className="px-3 py-2.5 sm:px-4">
                      {position === 1 ? (
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-[#E3C273] px-1.5 text-sm font-extrabold tabular-nums text-black">
                          1
                        </span>
                      ) : (
                        <span
                          className={`inline-flex h-7 min-w-7 items-center justify-center px-1.5 tabular-nums ${
                            position <= 3 ? "font-extrabold text-black" : "font-semibold text-black/60"
                          }`}
                        >
                          {position}
                        </span>
                      )}
                    </td>
                    <td className="max-w-0 truncate px-3 py-2.5 sm:px-4">
                      <Link
                        href={`/ranking/${player.id}`}
                        className="font-semibold text-black underline-offset-2 hover:underline"
                      >
                        {player.name} {player.lastname}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-2.5 text-right tabular-nums text-black/60 sm:table-cell sm:px-4">
                      {player.matches_played}
                    </td>
                    <td className="px-3 py-2.5 text-right font-extrabold tabular-nums text-black sm:px-4">
                      {player.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
