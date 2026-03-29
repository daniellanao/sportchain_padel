import Link from "next/link";

import { fetchPlayersListFromSupabase } from "@/lib/ranking/supabase-players";

/** Served from `public/sportchain_padel_ranking_bg.png` → `/sportchain_padel_ranking_bg.png` */
const HERO_BACKGROUND_URL = "/sportchain_padel_background.png";

const heroPanelClass =
  "border-4 border-[var(--color-accent-gold)] bg-[rgba(11,31,59,0.92)] shadow-[8px_8px_0_rgba(0,0,0,0.35)]";

/**
 * Hero: full-viewport intro with pixel-art background.
 * Contrast: darker overlay + opaque navy panel; body copy uses near-white on dark (not --color-subtle-text, which is for light surfaces).
 */
export async function Hero() {
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
      id="home"
      className="relative flex min-h-[calc(100vh-84px)] flex-col items-center justify-center px-5 py-16 sm:py-20"
      style={{
        backgroundImage: `linear-gradient(rgba(11, 31, 59, 0.62), rgba(11, 31, 59, 0.74)), url('${HERO_BACKGROUND_URL}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    >
      <div className="flex w-full max-w-6xl flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-10">
        <div className={`w-full flex-1 p-6 text-center sm:p-10 ${heroPanelClass}`}>
          <p className="navbar-text mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-accent-gold)]">
            Clasificación competitiva con ELO
          </p>

          <h1 className="mb-5 text-3xl font-black uppercase leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-5xl">
            Sportchain Padel
          </h1>

          <h2 className="mb-5 text-3xl font-black uppercase leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-5xl">
            Ranking y torneos
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[rgba(232,236,245,0.92)] sm:text-base">
            Consulta el ranking ELO, sigue los torneos de los eventos Sportchain y revisa resultados con un
            sistema transparente pensado para jugadores y clubes de pádel.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="/ranking"
              className="navbar-text btn-gold inline-flex min-h-[48px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.3)] sm:flex-initial sm:min-w-[200px]"
            >
              Ver ranking
            </a>
            <a
              href="/torneos"
              className="navbar-text btn-gold inline-flex min-h-[48px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.3)] sm:flex-initial sm:min-w-[200px]"
            >
              Ver torneos
            </a>
          </div>
        </div>

        <div className={`w-full shrink-0 p-5 sm:p-6 lg:max-w-md lg:basis-[min(100%,22rem)] ${heroPanelClass}`}>
          <p className="navbar-text mb-3 text-center text-xs uppercase tracking-[0.15em] text-[var(--color-accent-gold)]">
            Top 10 ranking
          </p>

          {!result.ok ? (
            <p className="text-center text-xs leading-relaxed text-[rgba(232,236,245,0.85)]">{result.error}</p>
          ) : top10.length === 0 ? (
            <p className="text-center text-xs text-[rgba(232,236,245,0.85)]">Aún no hay jugadores en el ranking.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-left text-xs leading-tight">
                <thead>
                  <tr className="border-b-2 border-[var(--color-accent-gold)] text-[rgba(232,236,245,0.95)]">
                    <th className="navbar-text w-[14%] px-1 py-2 text-[10px] uppercase sm:px-2">Pos.</th>
                    <th className="navbar-text px-1 py-2 text-[10px] uppercase sm:px-2">Nombre</th>
                    <th className="navbar-text w-[22%] px-1 py-2 text-right text-[10px] uppercase sm:px-2">ELO</th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map(({ player, position }, index) => (
                    <tr
                      key={player.id}
                      className={
                        index % 2 === 0
                          ? "border-b border-white/10 bg-white/[0.04]"
                          : "border-b border-white/10 bg-transparent"
                      }
                    >
                      <td className="px-1 py-2 font-mono tabular-nums text-[var(--color-accent-gold)] sm:px-2">
                        {position}
                      </td>
                      <td className="truncate px-1 py-2 font-medium text-[rgba(232,236,245,0.95)] sm:px-2">
                        <Link
                          href={`/ranking/${player.id}`}
                          className="text-[rgba(232,236,245,0.95)] underline-offset-2 hover:text-[var(--color-accent-gold)] hover:underline"
                        >
                          {player.name} {player.lastname}
                        </Link>
                      </td>
                      <td className="navbar-text px-1 py-2 text-right tabular-nums text-[var(--color-accent-gold)] sm:px-2">
                        {player.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link
              href="/ranking"
              className="navbar-text inline-block text-[10px] uppercase tracking-wide text-[var(--color-accent-gold)] underline-offset-4 hover:underline"
            >
              Ver ranking completo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
