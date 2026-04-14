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
      className={`rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-surface)] px-4 py-5 shadow-sm sm:px-6 sm:py-6 ${className}`}
    >
      <h2
        id="sportchain-about-heading"
        className="navbar-text mb-2 text-sm uppercase tracking-[0.1em] text-[var(--color-primary)]"
      >
        ¿Qué es Sportchain?
      </h2>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-[color:var(--color-subtle-text)]">
        Sportchain es una plataforma que quiere fomentar el deporte y que busca crear complejos deportivos 
        financiados por la comunidad. Para mayor información, visita el sitio principal de Sportchain.
      </p>
      <a
        href={SPORTCHAIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="navbar-text btn-gold inline-flex min-h-[44px] items-center justify-center border-3 border-[var(--color-accent-gold)] px-5 py-2.5 text-xs uppercase shadow-[5px_5px_0_rgba(0,0,0,0.15)] transition hover:brightness-[1.02] rounded-lg"
      >
 
        Visitar sportchain.io
      </a>
    </section>
  );
}
