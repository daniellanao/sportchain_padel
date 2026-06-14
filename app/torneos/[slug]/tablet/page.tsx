import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RoundMatches, type RoundMatchRow, type RoundMatchesRound } from "@/components/tournaments/RoundMatches";
import { StandingsTable } from "@/components/tournaments/StandingsTable";
import { formatTournamentFormatLabel } from "@/data/tournaments";
import { absoluteUrl } from "@/lib/site-config";
import { fetchTournamentPageData } from "@/lib/tournaments/tournament-page-data";
import { fetchTournamentBySlugFromSupabase } from "@/lib/tournaments/supabase-list";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const roundTextClass =
  "text-[length:clamp(0.85rem,1.55vw,1.15rem)] leading-snug [&_tbody_td]:py-1 [&_thead_th]:py-1 [&_tr]:leading-snug";
const standingsTextClass =
  "text-[length:clamp(0.9rem,1.75vw,1.3rem)] leading-snug [&_tbody_td]:py-1 [&_thead_th]:py-1 [&_tr]:leading-snug";
const tabletRoundMatchProps = {
  title: "",
  compact: true,
  hideCourtColumn: true,
  scoreColumnLabel: "Res.",
} as const;

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

function roundByNumber(
  rounds: RoundMatchesRound[],
  n: number,
  label?: string,
): RoundMatchesRound {
  const found = rounds.find((r) => r.roundNumber === n);
  if (found) return { ...found, label: label ?? found.label };
  return {
    roundNumber: n,
    label: label ?? `Ronda ${n}`,
    matches: [],
  };
}

/** Ronda 5: primer partido = final, segundo = 3er puesto (si existe). */
function splitFinalRound(matches: RoundMatchRow[]): {
  final: RoundMatchRow[];
  third: RoundMatchRow[];
} {
  if (matches.length === 0) return { final: [], third: [] };
  if (matches.length === 1) return { final: [matches[0]], third: [] };
  return { final: [matches[0]], third: matches.slice(1) };
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
  const semis = roundByNumber(roundMatchesRounds, 4, "Semifinales");
  const finalsRound = roundByNumber(roundMatchesRounds, 5, "Final");
  const { final: finalMatches, third: thirdMatches } = splitFinalRound(finalsRound.matches);
  const finalRound: RoundMatchesRound = {
    roundNumber: 5,
    label: "Final",
    matches: finalMatches,
  };
  const thirdRound: RoundMatchesRound = {
    roundNumber: 5,
    label: "3er puesto",
    matches: thirdMatches,
  };

  return (
    <div className="grid h-full min-h-0 w-full flex-1 grid-cols-3 gap-x-2 overflow-hidden bg-[var(--background)] px-2 py-2 text-[var(--foreground)] sm:gap-x-3 sm:px-3 sm:py-3">
      <div className="col-start-1 flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden sm:gap-3">
        <div className={`min-h-0 flex-1 overflow-hidden ${roundTextClass}`}>
          <RoundMatches rounds={[round1]} {...tabletRoundMatchProps} headerColor="#dc2626" />
        </div>
        <div className={`min-h-0 flex-1 overflow-hidden ${roundTextClass}`}>
          <RoundMatches rounds={[round2]} {...tabletRoundMatchProps} headerColor="#2563eb" />
        </div>
        <div className={`min-h-0 flex-1 overflow-hidden ${roundTextClass}`}>
          <RoundMatches rounds={[round3]} {...tabletRoundMatchProps} headerColor="#eab308" />
        </div>
      </div>

      <div className="col-span-2 col-start-2 flex min-h-0 min-w-0 flex-col gap-1 overflow-hidden sm:gap-1.5">
        <div className={`min-h-0 shrink-0 overflow-y-auto overflow-x-hidden ${standingsTextClass}`}>
          <StandingsTable rows={standingsRows} title="" compact />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-1 overflow-hidden sm:gap-1.5">
          <div className={`min-h-0 min-w-0 overflow-hidden ${roundTextClass}`}>
            <RoundMatches rounds={[semis]} {...tabletRoundMatchProps} headerColor="#16a34a" />
          </div>
          <div className="flex min-h-0 min-w-0 flex-col gap-1 overflow-hidden sm:gap-1.5">
            <div className={`min-h-0 flex-1 overflow-hidden ${roundTextClass}`}>
              <RoundMatches rounds={[finalRound]} {...tabletRoundMatchProps} headerColor="#ca8a04" />
            </div>
            <div className={`min-h-0 flex-1 overflow-hidden ${roundTextClass}`}>
              <RoundMatches rounds={[thirdRound]} {...tabletRoundMatchProps} headerColor="#d97706" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
