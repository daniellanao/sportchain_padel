import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoundMatches, type RoundMatchesRound } from "@/components/tournaments/RoundMatches";
import { StandingsTable } from "@/components/tournaments/StandingsTable";
import { formatTournamentFormatLabel } from "@/data/tournaments";
import { DEFAULT_OG_IMAGES, absoluteUrl } from "@/lib/site-config";
import { fetchTournamentPageData } from "@/lib/tournaments/tournament-page-data";
import { fetchTournamentBySlugFromSupabase } from "@/lib/tournaments/supabase-list";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchTournamentBySlugFromSupabase(slug);
  if (!result.ok) {
    return { title: "Torneo" };
  }
  const { tournament } = result;
  const description = `${tournament.name}: ${tournament.dateLabel}, ${tournament.timeLabel}. ${formatTournamentFormatLabel(tournament)}. Pantalla TV.`;
  return {
    title: `${tournament.name} - TV`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${tournament.name} - TV`,
      description,
      url: `/torneos/${tournament.slug}/tv`,
      locale: "es_ES",
      images: DEFAULT_OG_IMAGES,
    },
    alternates: {
      canonical: absoluteUrl(`/torneos/${tournament.slug}/tv`),
    },
  };
}

function roundByNumber(rounds: RoundMatchesRound[], n: number): RoundMatchesRound {
  return (
    rounds.find((r) => r.roundNumber === n) ?? {
      roundNumber: n,
      label: `Ronda ${n}`,
      matches: [],
    }
  );
}

export default async function TournamentTvPage({ params }: PageProps) {
  const { slug } = await params;
  const loaded = await fetchTournamentPageData(slug);
  if (!loaded.ok) {
    notFound();
  }
  const { standingsRows, roundMatchesRounds } = loaded.data;

  const round1 = roundByNumber(roundMatchesRounds, 1);
  const round2 = roundByNumber(roundMatchesRounds, 2);
  const round3 = roundByNumber(roundMatchesRounds, 3);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-background font-bold text-foreground">
      <div className="w-full shrink-0 px-1.5 pt-1.5 text-[length:clamp(0.55rem,0.95vw,0.9rem)] leading-tight [&_tbody_td]:py-0.5 [&_thead_th]:py-0.5 [&_tr]:leading-tight sm:px-2 sm:pt-2">
        <StandingsTable rows={standingsRows} title="" compact />
      </div>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 gap-1 overflow-hidden px-1.5 pb-1.5 text-[length:clamp(0.5rem,0.85vw,0.8rem)] sm:gap-1.5 sm:px-2 sm:pb-2 sm:text-[length:clamp(0.52rem,0.88vw,0.82rem)]">
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <RoundMatches rounds={[round1]} title="" compact />
        </div>
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <RoundMatches rounds={[round2]} title="" compact />
        </div>
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <RoundMatches rounds={[round3]} title="" compact />
        </div>
      </div>
    </div>
  );
}
