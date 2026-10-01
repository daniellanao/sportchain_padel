import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "700",
});

const HERO_IMAGE = "/sportchain_torneo_padel.jpg";

/**
 * Hero: centered copy and CTAs on black, full-width court photo below.
 */
export function Hero() {
  return (
    <section
      id="home"
      className="flex h-[calc(100svh-3.5rem)] min-h-[30rem] flex-col bg-black"
    >
      <div className="mx-auto flex h-[55%] w-full max-w-4xl flex-col items-center justify-center px-4 py-4 text-center sm:px-6">
        <p className="logo mb-2 text-xs text-white animate-[hero-fade_0.7s_ease-out_both] sm:mb-3 sm:text-sm">
          SportChain <span className="font-semibold tracking-[0.06em] text-white/70">Padel</span>
        </p>

        <h1 className="max-w-2xl text-2xl font-extrabold leading-[1.15] tracking-tight text-[#E3C273] animate-[hero-fade_0.7s_ease-out_0.08s_both] sm:text-3xl md:text-4xl">
          Encuentra canchas de pádel y torneos para jugar
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-snug text-white/85 animate-[hero-fade_0.7s_ease-out_0.16s_both] sm:mt-3 sm:text-base">
          Descubre clubes, participa en torneos y mejora tu ranking.
        </p>

        <div className={`${montserrat.className} mt-4 flex w-full flex-col gap-2 animate-[hero-fade_0.7s_ease-out_0.24s_both] sm:mt-5 sm:w-auto sm:flex-row sm:justify-center sm:gap-3`}>
          <Link
            href="/clubes"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-6 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#12305D] transition hover:bg-white/90 active:scale-[0.99] sm:min-w-[9.5rem]"
          >
            Ver clubes
          </Link>
          <Link
            href="/torneos"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/50 bg-transparent px-6 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 active:scale-[0.99] sm:min-w-[9.5rem]"
          >
            Ver torneos
          </Link>
        </div>
      </div>

      <div className="relative h-[45%] w-full overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Jugadores de pádel en un torneo SportChain"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center motion-safe:animate-[hero-breathe_12s_ease-in-out_infinite_alternate]"
        />
      </div>
    </section>
  );
}
