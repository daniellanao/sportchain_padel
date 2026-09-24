import type { Metadata } from "next";
import Image from "next/image";

import { Navbar } from "@/components/Navbar";
import { isRemoteImageSrc } from "@/lib/image-remote";
import { fetchVenuesListFromSupabase } from "@/lib/venues/supabase-venues";

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

export default async function ClubesPage() {
  const result = await fetchVenuesListFromSupabase();
  const venues = result.venues;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          Clubes
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-subtle-text)]">
          Sedes y clubes de pádel.
        </p>

        {!result.ok ? (
          <p className="mt-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        {venues.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--color-subtle-text)]">
            Aún no hay clubes registrados.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {venues.map((venue) => {
              const stars = formatStars(venue.stars);
              const webHref = venue.web?.trim() ? normalizeWebHref(venue.web) : null;
              const phone = venue.phone?.trim() || null;

              return (
                <li
                  key={venue.id}
                  className="flex gap-3 border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-3 shadow-[4px_4px_0_rgba(0,0,0,0.15)]"
                >
                  <div className="shrink-0">
                    {venue.image ? (
                      <Image
                        src={venue.image}
                        alt={venue.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 border-2 border-[var(--color-primary)] object-cover"
                        unoptimized={isRemoteImageSrc(venue.image)}
                      />
                    ) : (
                      <span
                        className="inline-flex h-14 w-14 items-center justify-center border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-lg font-bold uppercase text-[var(--color-primary)]"
                        aria-hidden
                      >
                        {venue.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold uppercase leading-tight text-[var(--color-primary)]">
                      {venue.name}
                    </h2>
                    {stars ? (
                      <p className="mt-0.5 text-xs tabular-nums text-[var(--color-accent-gold)]">
                        ★ {stars}
                      </p>
                    ) : null}
                    {venue.address ? (
                      <p className="mt-1 truncate text-xs text-[var(--color-subtle-text)]" title={venue.address}>
                        {venue.address}
                      </p>
                    ) : null}
                    {(webHref || phone) && (
                      <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] uppercase tracking-wide">
                        {webHref ? (
                          <a
                            href={webHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                          >
                            Web
                          </a>
                        ) : null}
                        {phone ? (
                          <a
                            href={`tel:${phone.replace(/\s+/g, "")}`}
                            className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                          >
                            Tel
                          </a>
                        ) : null}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
