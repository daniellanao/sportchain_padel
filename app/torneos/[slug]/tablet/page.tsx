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
  const description = `${tournament.name}: ${tournament.dateLabel}, ${tournament.timeLabel}. ${formatTournamentFormatLabel(tournament)}. Vista tablet.`;
  return {
    title: `${tournament.name} - Tablet`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${tournament.name} - Tablet`,
      description,
      url: `/torneos/${tournament.slug}/tablet`,
      locale: "es_ES",
    },
    alternates: {
      canonical: absoluteUrl(`/torneos/${tournament.slug}/tablet`),
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

export default async function TournamentTabletPage({ params }: PageProps) {
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
    <div className="flex h-full min-h-0 w-full flex-1 gap-2 overflow-hidden bg-[var(--background)] px-2 py-2 text-[var(--foreground)] sm:gap-3 sm:px-3 sm:py-3">
      <div className="flex w-[60%] shrink-0 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-[length:clamp(0.9rem,1.75vw,1.3rem)] leading-snug [&_tbody_td]:py-1 [&_thead_th]:py-1 [&_tr]:leading-snug">
          <StandingsTable rows={standingsRows} title="" compact />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden text-[length:clamp(0.85rem,1.55vw,1.15rem)] leading-snug sm:gap-3 [&_tbody_td]:py-1 [&_thead_th]:py-1 [&_tr]:leading-snug">
        <RoundMatches rounds={[round1]} title="" compact headerColor="#dc2626" />
        <RoundMatches rounds={[round2]} title="" compact headerColor="#2563eb" />
        <RoundMatches rounds={[round3]} title="" compact headerColor="#eab308" />
      </div>
    </div>
  );
}
