import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE = "/sportchain_torneo_padel.jpg";

/**
 * Full-bleed hero: brand, headline, support line, CTAs over court photo.
 */
export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[min(88vh,52rem)] flex-col justify-end overflow-hidden sm:min-h-[min(90vh,56rem)]"
    >
      <Image
        src={HERO_IMAGE}
        alt="Jugadores de pádel en un torneo SportChain"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center animate-[hero-zoom_18s_ease-out_forwards]"
      />

      {/* 20% navy veil + soft bottom fade for text */}
      <div className="absolute inset-0 bg-[#12305D]/20" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <p className="logo mb-5 text-sm text-white animate-[hero-fade_0.7s_ease-out_both] sm:text-base">
          SportChain <span className="font-semibold tracking-[0.06em] text-white/70">Padel</span>
        </p>

        <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-tight text-[#E3C273] animate-[hero-fade_0.7s_ease-out_0.08s_both] sm:text-4xl md:text-5xl md:leading-[1.1]">
          Encuentra canchas de pádel y torneos para jugar
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 animate-[hero-fade_0.7s_ease-out_0.16s_both] sm:text-lg">
          Descubre clubes, participa en torneos y mejora tu ranking.
        </p>

        <div className="mt-8 flex flex-col gap-3 animate-[hero-fade_0.7s_ease-out_0.24s_both] sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/clubes"
            className="inline-flex min-h-12 items-center justify-center bg-white px-8 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#12305D] transition hover:bg-white/90 active:scale-[0.99] sm:min-w-[10.5rem]"
          >
            Ver clubes
          </Link>
          <Link
            href="/torneos"
            className="inline-flex min-h-12 items-center justify-center border border-white/50 bg-transparent px-8 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white/10 active:scale-[0.99] sm:min-w-[10.5rem]"
          >
            Ver torneos
          </Link>
        </div>
      </div>
    </section>
  );
}
