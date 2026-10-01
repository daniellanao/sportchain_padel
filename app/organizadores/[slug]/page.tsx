import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { RankingPlayersTable } from "@/components/ranking/RankingPlayersTable";
import { isRemoteImageSrc } from "@/lib/image-remote";
import {
  fetchOrganizerBySlugFromSupabase,
  fetchOrganizerRankedPlayersFromSupabase,
} from "@/lib/organizers/supabase-organizers";
import { absoluteUrl } from "@/lib/site-config";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchOrganizerBySlugFromSupabase(slug);
  if (!result.ok) {
    return { title: "Organizador" };
  }
  const { organizer } = result;
  return {
    title: organizer.name,
    openGraph: {
      title: organizer.name,
      url: `/organizadores/${organizer.slug}`,
      locale: "es_ES",
    },
    alternates: {
      canonical: absoluteUrl(`/organizadores/${organizer.slug}`),
    },
  };
}

export default async function OrganizerPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await fetchOrganizerBySlugFromSupabase(slug);
  if (!result.ok) {
    notFound();
  }
  const { organizer } = result;

  const ranking = await fetchOrganizerRankedPlayersFromSupabase(organizer.id);
  const players = ranking.players;

  let lastRating: number | null = null;
  let lastPosition = 0;
  const rankedPlayers = players.map((player, index) => {
    if (lastRating === null || player.rating !== lastRating) {
      lastPosition = index + 1;
      lastRating = player.rating;
    }
    return { player, index, position: lastPosition };
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl py-8 sm:py-10">
          <Link
            href="/organizadores"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/60 transition hover:text-white"
          >
            ← Organizadores
          </Link>

          <div className="mt-6 flex flex-col items-center pb-4 text-center">
            {organizer.image ? (
              <Image
                src={organizer.image}
                alt={organizer.name}
                width={72}
                height={72}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20 sm:h-[4.5rem] sm:w-[4.5rem]"
                unoptimized={isRemoteImageSrc(organizer.image)}
              />
            ) : null}
            <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
              Organizador
            </p>
            <h1 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
              {organizer.name}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-white/80 sm:text-base">
              Ranking de jugadores que han participado al menos una vez con este organizador.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {!ranking.ok ? (
          <p className="mb-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {ranking.error}
          </p>
        ) : null}

        <RankingPlayersTable
          rankedPlayers={rankedPlayers}
          emptyMessage="Aún no hay jugadores asociados a este organizador."
        />
      </main>
    </div>
  );
}
