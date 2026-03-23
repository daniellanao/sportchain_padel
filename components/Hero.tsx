/** Served from `public/sportchain_padel_ranking_bg.png` → `/sportchain_padel_ranking_bg.png` */
const HERO_BACKGROUND_URL = "/sportchain_padel_background.png";

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
      <div className="w-full max-w-3xl border-4 border-[var(--color-accent-gold)] bg-[rgba(11,31,59,0.92)] p-6 text-center shadow-[8px_8px_0_rgba(0,0,0,0.35)] sm:p-10">
        <p className="navbar-text mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-accent-gold)]">
          ELO-Based Competitive Ladder
        </p>

        <h1 className="mb-5 text-3xl font-black uppercase leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-5xl">
          Sportchain Padel Ranking
        </h1>

        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[rgba(232,236,245,0.92)] sm:text-base">
          Track every match, update ratings instantly, and climb the leaderboard with a
          transparent ELO system designed for padel players and clubs.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a
            href="/ranking"
            className="navbar-text btn-gold inline-flex min-h-[48px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.3)] sm:flex-initial sm:min-w-[200px]"
          >
            View Ranking
          </a>
          <a
            href="/tournaments"
            className="navbar-text btn-gold inline-flex min-h-[48px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.3)] sm:flex-initial sm:min-w-[200px]"
          >
            View Tournaments
          </a>
        </div>
      </div>
    </section>
  );
}
