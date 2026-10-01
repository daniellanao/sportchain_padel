import Link from "next/link";

import { VenueCard } from "@/components/venues/VenueCard";
import { compareVenuesByRating, fetchVenuesListFromSupabase } from "@/lib/venues/supabase-venues";

/** Home: los 3 clubes mejor valorados en Google. */
export async function HomeTopClubsSection() {
  const result = await fetchVenuesListFromSupabase();
  const top3 = [...result.venues].sort(compareVenuesByRating).slice(0, 3);

  return (
    <section aria-labelledby="home-clubs-heading" className="bg-[var(--color-surface)] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--color-subtle-text)]">
              Mejor valorados en Google
            </p>
            <h2
              id="home-clubs-heading"
              className="mt-1 text-xl font-extrabold uppercase tracking-tight text-black sm:text-2xl"
            >
              Top 3 clubes
            </h2>
          </div>
          <Link
            href="/clubes"
            className="inline-flex min-h-10 items-center self-start rounded-md border border-black/25 px-4 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black hover:bg-black hover:text-white sm:self-auto"
          >
            Ver todos los clubes
          </Link>
        </div>

        {!result.ok ? (
          <p className="rounded-lg border border-black/10 px-4 py-6 text-center text-sm text-[var(--color-subtle-text)]">
            {result.error}
          </p>
        ) : top3.length === 0 ? (
          <p className="text-sm text-[var(--color-subtle-text)]">Aún no hay clubes registrados.</p>
        ) : (
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {top3.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
