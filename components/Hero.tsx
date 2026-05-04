import Link from "next/link";

const HERO_BACKGROUND_URL = "/sportchain_padel_background.png";

/**
 * Hero: full-viewport intro with background image.
 * Glass panel, tight typography, soft overlay for contrast.
 */
export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100vh-84px)] flex-col items-center justify-center px-5 py-16 sm:py-24"
      style={{
        backgroundImage: `linear-gradient(165deg, rgba(11, 31, 59, 0.78) 0%, rgba(11, 31, 59, 0.55) 45%, rgba(11, 31, 59, 0.72) 100%), url('${HERO_BACKGROUND_URL}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    >
      <div className="relative w-full max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-[rgba(11,31,59,0.45)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-12">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-gold)] sm:text-xs">
            Sportchain
          </p>

          <h1 className="mb-4 text-center text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl sm:leading-tight md:text-5xl">
            Pádel: ranking y torneos
          </h1>

          <p className="mx-auto max-w-lg text-center text-[15px] leading-relaxed text-white/80 sm:text-base">
            Consulta el ranking general, resultados y torneos para seguir sumando puntos.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/ranking"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--color-accent-gold)] px-8 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition hover:brightness-105 active:scale-[0.98] sm:min-w-[11rem]"
            >
              Ver ranking
            </Link>
            <Link
              href="/torneos"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 active:scale-[0.98] sm:min-w-[11rem]"
            >
              Ver torneos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
