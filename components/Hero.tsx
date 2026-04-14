import Link from "next/link";

/** Served from `public/sportchain_padel_ranking_bg.png` → `/sportchain_padel_ranking_bg.png` */
const HERO_BACKGROUND_URL = "/sportchain_padel_background.png";

const heroPanelClass =
  "border-4 border-[var(--color-accent-gold)] bg-[rgba(11,31,59,0.92)] shadow-[8px_8px_0_rgba(0,0,0,0.35)]";

/**
 * Hero: full-viewport intro with pixel-art background.
 * Contrast: darker overlay + opaque navy panel; body copy uses near-white on dark (not --color-subtle-text, which is for light surfaces).
 */
export function Hero() {
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
      <div className="flex w-full max-w-3xl flex-col items-stretch">
        <div className={`w-full p-6 text-center sm:p-10 ${heroPanelClass}`}>
          <h1 className="mb-5 text-3xl font-black uppercase leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-5xl">
            Padel - Sportchain
          </h1>

          <h2 className="mb-4 text-xl font-bold uppercase leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-2xl">
            Ranking y torneos
          </h2>
     
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[rgba(232,236,245,0.92)] sm:text-base">
            Portal para ver el ranking general de jugadores de pádel, resultados y busqueda de torneos para seguir sumando puntos.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/ranking"
              className="navbar-text btn-gold inline-flex min-h-[48px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.3)] sm:flex-initial sm:min-w-[200px]"
            >
              Ver ranking
            </Link>
            <Link
              href="/torneos"
              className="navbar-text btn-gold inline-flex min-h-[48px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.3)] sm:flex-initial sm:min-w-[200px]"
            >
              Ver torneos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
