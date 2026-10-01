import type { Metadata } from "next";

import { Navbar } from "@/components/Navbar";
import { VenueCard } from "@/components/venues/VenueCard";
import { compareVenuesByRating, fetchVenuesListFromSupabase } from "@/lib/venues/supabase-venues";

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

export default async function ClubesPage() {
  const result = await fetchVenuesListFromSupabase();
  const venues = [...result.venues].sort(compareVenuesByRating);

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
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
