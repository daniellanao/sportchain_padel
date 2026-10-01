import Image from "next/image";

/**
 * Promo a todo el ancho del próximo torneo destacado (home y `/torneos`).
 * Datos fijos: actualizar aquí cuando cambie el torneo.
 */
export function FeaturedTournament() {
  return (
    <section aria-labelledby="featured-tournament-title" className="relative isolate w-full overflow-hidden">
      <Image
        src="/torneos/torneo_sportchain_ourbit.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-black/70" aria-hidden />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[#E3C273]">Próximo torneo</p>
        <h2
          id="featured-tournament-title"
          className="text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl"
        >
          Torneo de Pádel
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          Torneo de pádel para la comunidad de StartUps, Tech y Web3.
        </p>

        <dl className="flex flex-wrap gap-x-10 gap-y-3 border-y border-white/15 py-4 sm:max-w-md">
          <div>
            <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/60">Fecha</dt>
            <dd className="mt-1 text-base font-bold text-white">25 de octubre de 2026</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/60">Hora</dt>
            <dd className="mt-1 text-base font-bold tabular-nums text-white">10:00</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href="https://luma.com/env6mvi7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#E3C273] px-8 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#E3C273]/90"
          >
            Inscribirse
          </a>
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-white/60">
            Sponsored by <span className="font-bold text-white">Ourbit</span>
          </p>
        </div>
      </div>
    </section>
  );
}
