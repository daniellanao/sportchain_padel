import Image from "next/image";

/**
 * Bloque breve sobre Sportchain + enlace al sitio principal (reutilizable en home, ranking, torneos).
 */
const SPORTCHAIN_URL = "https://sportchain.io";

type SportchainAboutProps = {
  className?: string;
};

export function SportchainAbout({ className = "" }: SportchainAboutProps) {
  return (
    <section
      aria-labelledby="sportchain-about-heading"
      className={`flex flex-col gap-6 rounded-xl border border-black/10 bg-[var(--color-surface)] p-6 shadow-sm sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10 ${className}`}
    >
      <div className="flex gap-4 sm:gap-5">
        <Image
          src="/sportchain_isotipo.png"
          alt=""
          width={48}
          height={48}
          className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
        />
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[var(--color-subtle-text)]">
            Sobre nosotros
          </p>
          <h2
            id="sportchain-about-heading"
            className="mt-1 text-xl font-extrabold leading-tight tracking-tight text-black sm:text-2xl"
          >
            ¿Qué es SportChain?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-subtle-text)] sm:text-base">
            SportChain es una plataforma que quiere fomentar el deporte y que busca crear complejos deportivos
            financiados por la comunidad.
          </p>
        </div>
      </div>

      <a
        href={SPORTCHAIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 shrink-0 items-center justify-center self-start rounded-lg bg-black px-6 text-xs font-bold uppercase tracking-[0.14em] text-[#E3C273] transition hover:bg-black/85 md:self-center"
      >
        Visitar sportchain.io
      </a>
    </section>
  );
}
