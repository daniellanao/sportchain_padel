import type { Metadata } from "next";
import { faArrowLeft, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
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
      url: `/organizador/${organizer.slug}`,
      locale: "es_ES",
    },
    alternates: {
      canonical: absoluteUrl(`/organizador/${organizer.slug}`),
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

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/organizadores"
            className="navbar-text inline-flex items-center gap-2 border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-4 py-2 text-xs uppercase text-white transition hover:brightness-110"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3 shrink-0" aria-hidden />
            Organizadores
          </Link>
        </div>
        <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          {organizer.name}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-subtle-text)]">
          Ranking de jugadores que han participado al menos una vez con este organizador.
        </p>

        {!ranking.ok ? (
          <p className="mt-4 rounded border-2 border-amber-600/60 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
            {ranking.error}
          </p>
        ) : null}

        <div className="mt-6 overflow-hidden border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
          <table className="w-full table-fixed border-collapse text-left text-xs leading-tight">
            <thead>
              <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                <th className="navbar-text w-[10%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5">
                  #
                </th>
                <th className="navbar-text w-[40%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5">
                  Nombre
                </th>
                <th
                  className="navbar-text w-[10%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5"
                  title="Partidos jugados"
                >
                  Part.
                </th>
                <th
                  className="navbar-text w-[20%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5"
                  title="Puntos ELO"
                >
                  ELO
                </th>
                <th
                  className="navbar-text w-[20%] whitespace-nowrap px-2 py-1.5 text-[10px] uppercase sm:px-2.5"
                  title="Detalle del jugador"
                >
                  Det.
                </th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-[var(--color-muted)] bg-[var(--color-surface)] px-3 py-4 text-center text-xs text-[var(--color-subtle-text)] sm:px-4"
                  >
                    Aún no hay jugadores asociados a este organizador.
                  </td>
                </tr>
              ) : (
                rankedPlayers.map(({ player, index, position }) => (
                  <tr
                    key={player.id}
                    className={
                      index % 2 === 0
                        ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                        : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                    }
                  >
                    <td className="w-[10%] px-2 py-1.5 text-center font-mono tabular-nums text-[var(--color-primary)] sm:px-2.5">
                      {position}
                    </td>
                    <td className="w-[40%] truncate px-2 py-1.5 font-medium text-[var(--color-foreground)] sm:px-2.5">
                      {player.name} {player.lastname}
                      {player.stars != null && player.stars > 0 ? (
                        <span className="ml-1 inline-flex translate-y-[1px] items-center align-middle">
                          <span className="relative inline-flex h-4 w-4 items-center justify-center text-[var(--color-primary)]">
                            <FontAwesomeIcon icon={faStar} className="h-4 w-4" aria-hidden />
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none text-white">
                              {player.stars}
                            </span>
                          </span>
                        </span>
                      ) : null}
                    </td>
                    <td className="w-[10%] px-2 py-1.5 text-center tabular-nums text-[var(--color-subtle-text)] sm:px-2.5">
                      {player.matches_played}
                    </td>
                    <td className="navbar-text w-[20%] px-2 py-1.5 text-center tabular-nums text-[var(--color-primary)] sm:px-2.5">
                      {player.rating}
                    </td>
                    <td className="w-[20%] px-1.5 py-1 sm:px-2">
                      <Link
                        href={`/ranking/${player.id}`}
                        className="navbar-text btn-gold inline-flex min-h-[26px] items-center justify-center whitespace-nowrap border-2 border-[var(--color-accent-gold)] px-2 py-0.5 text-[9px] uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:brightness-105 sm:text-[10px]"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
