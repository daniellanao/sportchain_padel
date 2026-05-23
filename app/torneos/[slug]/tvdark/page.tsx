import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoundMatches, type RoundMatchesRound } from "@/components/tournaments/RoundMatches";
import { StandingsTable } from "@/components/tournaments/StandingsTable";
import { formatTournamentFormatLabel } from "@/data/tournaments";
import { absoluteUrl } from "@/lib/site-config";
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
  const description = `${tournament.name}: ${tournament.dateLabel}, ${tournament.timeLabel}. ${formatTournamentFormatLabel(tournament)}. Pantalla TV (oscuro).`;
  return {
    title: `${tournament.name} - TV Dark `,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${tournament.name} - TV Dark`,
      description,
      url: `/torneos/${tournament.slug}/tvdark`,
      locale: "es_ES",
    },
    alternates: {
      canonical: absoluteUrl(`/torneos/${tournament.slug}/tvdark`),
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

export default async function TournamentTvDarkPage({ params }: PageProps) {
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="w-full shrink-0 px-1.5 pt-1.5 text-[length:clamp(0.6rem,1.02vw,0.92rem)] leading-tight [&_tbody_td]:py-0.5 [&_thead_th]:py-0.5 [&_tr]:leading-tight sm:px-2 sm:pt-2">
        <StandingsTable rows={standingsRows} title="" compact />
      </div>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 gap-1 overflow-hidden px-1.5 pb-1.5 text-[length:clamp(0.5rem,0.85vw,0.8rem)] sm:gap-1.5 sm:px-2 sm:pb-2 sm:text-[length:clamp(0.52rem,0.88vw,0.82rem)]">
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <RoundMatches rounds={[round1]} title="" compact headerColor="#dc2626" />
        </div>
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <RoundMatches rounds={[round2]} title="" compact headerColor="#2563eb" />
        </div>
        <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
          <RoundMatches rounds={[round3]} title="" compact headerColor="#eab308" />
        </div>
      </div>
    </div>
  );
}
