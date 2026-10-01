import type { Metadata } from "next";

import { DEFAULT_OG_IMAGES } from "@/lib/site-config";
import Image from "next/image";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { isRemoteImageSrc } from "@/lib/image-remote";
import { fetchOrganizersListFromSupabase } from "@/lib/organizers/supabase-organizers";

const description =
  "Organizadores de pádel Sportchain: consulta el ranking de jugadores de cada organizador.";

export const metadata: Metadata = {
  title: "Organizadores",
  description,
  openGraph: {
    title: "Organizadores — Sportchain Padel",
    description,
    url: "/organizadores",
    locale: "es_ES",
    images: DEFAULT_OG_IMAGES,
  },
  alternates: {
    canonical: "/organizadores",
  },
};

export const revalidate = 60;

export default async function OrganizersPage() {
  const result = await fetchOrganizersListFromSupabase();
  const organizers = result.organizers;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="flex h-[30svh] min-h-[13rem] items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
            Organizadores · Pádel
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
            Organizadores
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-white/80 sm:text-base">
            Cada organizador tiene su propio ranking con los jugadores que compitieron en sus torneos.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!result.ok ? (
          <p className="mb-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {result.error}
          </p>
        ) : null}

        {organizers.length === 0 ? (
          <p className="text-sm text-[var(--color-subtle-text)]">Aún no hay organizadores registrados.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {organizers.map((organizer) => (
              <li key={organizer.id}>
                <Link
                  href={`/organizadores/${organizer.slug}`}
                  className="group flex items-center gap-4 rounded-lg border border-black/10 bg-[var(--color-surface)] p-4 shadow-sm transition hover:border-black/30 hover:shadow-md"
                >
                  {organizer.image ? (
                    <Image
                      src={organizer.image}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                      unoptimized={isRemoteImageSrc(organizer.image)}
                    />
                  ) : (
                    <span
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-base font-extrabold uppercase text-white"
                      aria-hidden
                    >
                      {organizer.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold uppercase leading-tight text-black">
                      {organizer.name}
                    </h2>
                    <p className="mt-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[var(--color-subtle-text)] transition group-hover:text-black">
                      Ver ranking →
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
