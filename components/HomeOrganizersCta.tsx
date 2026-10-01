import Link from "next/link";

const CONTACT_URL = `https://wa.me/5491172369694?text=${encodeURIComponent(
  "Hola, quiero publicar mi torneo en SportChain Padel.",
)}`;

const BENEFITS = [
  {
    title: "Publica tu torneo",
    text: "Tu torneo visible para toda la comunidad de pádel de Buenos Aires, con inscripción directa.",
  },
  {
    title: "Ranking ELO automático",
    text: "Cada partido actualiza el ELO de los jugadores. Sin planillas ni cálculos manuales.",
  },
  {
    title: "Ranking de tu comunidad",
    text: "Una página propia con el ranking de los jugadores que compiten en tus torneos.",
  },
] as const;

/** Home: invitación a organizadores para publicar torneos y usar el ELO. */
export function HomeOrganizersCta() {
  return (
    <section aria-labelledby="home-organizers-heading" className="bg-black py-14 text-white sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60">Organizadores</p>
          <h2
            id="home-organizers-heading"
            className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl"
          >
            ¿Organizas torneos de pádel?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            Publica tu torneo en SportChain Padel y usa nuestro ranking ELO para que cada partido cuente.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#E3C273] px-6 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#E3C273]/90"
            >
              Publicar mi torneo
            </a>
            <Link
              href="/ranking/calculo"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Cómo funciona el ELO
            </Link>
          </div>
        </div>

        <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-sm font-extrabold tabular-nums text-black">
                {i + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide">{b.title}</h3>
                <p className="mt-1 text-sm leading-snug text-white/65">{b.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
