import type { Metadata } from "next";

import { Navbar } from "@/components/Navbar";
import { fetchVenuesListFromSupabase, type VenueDbRow } from "@/lib/venues/supabase-venues";

const description =
  "Clubes y sedes de pádel Sportchain: direcciones, contacto y valoración de cada club.";

export const metadata: Metadata = {
  title: "Clubes",
  description,
  openGraph: {
    title: "Clubes — Sportchain Padel",
    description,
    url: "/clubes",
    locale: "es_ES",
  },
  alternates: {
    canonical: "/clubes",
  },
};

export const revalidate = 60;

function formatStars(s: number | null): string | null {
  if (s == null || Number.isNaN(s)) return null;
  return String(Math.round(s * 10) / 10);
}

function normalizeWebHref(web: string): string {
  const t = web.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function webLabel(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./i, "");
  } catch {
    return href;
  }
}

function compareVenues(a: VenueDbRow, b: VenueDbRow): number {
  const sa = a.stars == null || Number.isNaN(a.stars) ? -1 : a.stars;
  const sb = b.stars == null || Number.isNaN(b.stars) ? -1 : b.stars;
  if (sa !== sb) return sb - sa;
  return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
}

export default async function ClubesPage() {
  const result = await fetchVenuesListFromSupabase();
  const venues = [...result.venues].sort(compareVenues);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="flex h-[30svh] min-h-[13rem] items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
            Club · Complejo · Cancha
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
            Encuentra tu cancha
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-white/80 sm:text-base">
            Explora cada club y complejo de pádel y encuentra la cancha ideal para tu próximo partido.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!result.ok ? (
          <p className="mb-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        {venues.length === 0 ? (
          <p className="text-sm text-[var(--color-subtle-text)]">
            Aún no hay clubes registrados.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {venues.map((venue) => {
              const stars = formatStars(venue.stars);
              const webHref = venue.web?.trim() ? normalizeWebHref(venue.web) : null;
              const phone = venue.phone?.trim() || null;

              return (
                <li
                  key={venue.id}
                  className="flex flex-col gap-2 rounded-lg border border-[#12305D]/15 bg-[var(--color-surface)] p-4 shadow-sm"
                >
                  <h2 className="truncate text-sm font-bold uppercase leading-tight text-[var(--color-primary)]">
                    {venue.name}
                  </h2>

                  <p className="flex items-center gap-1.5 text-xs">
                    {stars ? (
                      <>
                        <span className="font-bold tabular-nums text-[var(--color-foreground)]">{stars}</span>
                        <span className="text-[var(--color-accent-gold)]" aria-hidden>
                          ★
                        </span>
                        <span className="text-[var(--color-subtle-text)]">Google</span>
                      </>
                    ) : (
                      <span className="text-[var(--color-subtle-text)]">Sin valoración en Google</span>
                    )}
                  </p>

                  <dl className="mt-auto flex flex-col gap-1 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-[var(--color-subtle-text)]">Web</dt>
                      <dd className="min-w-0 truncate">
                        {webHref ? (
                          <a
                            href={webHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                          >
                            {webLabel(webHref)}
                          </a>
                        ) : (
                          <span className="text-[var(--color-subtle-text)]">—</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-[var(--color-subtle-text)]">Teléfono</dt>
                      <dd className="min-w-0 truncate">
                        {phone ? (
                          <a
                            href={`tel:${phone.replace(/\s+/g, "")}`}
                            className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                          >
                            {phone}
                          </a>
                        ) : (
                          <span className="text-[var(--color-subtle-text)]">—</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
