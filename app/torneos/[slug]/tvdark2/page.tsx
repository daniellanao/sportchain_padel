import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { KnockoutTvRoundPanel } from "@/components/tournaments/KnockoutTvRoundPanel";
import type { RoundMatchRow, RoundMatchesRound } from "@/components/tournaments/RoundMatches";
import { absoluteUrl } from "@/lib/site-config";
import { fetchTournamentPageData } from "@/lib/tournaments/tournament-page-data";
import { fetchTournamentBySlugFromSupabase } from "@/lib/tournaments/supabase-list";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const COLOR_QUARTERS = "#16a34a";
const COLOR_SEMIS = "#2563eb";
const COLOR_FINAL = "#eab308";
const COLOR_THIRD = "#d97706";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchTournamentBySlugFromSupabase(slug);
  if (!result.ok) {
    return { title: "Torneo" };
  }
  const { tournament } = result;
  const description = `${tournament.name}: fase eliminatoria (cuartos, semifinales, final). Pantalla TV.`;
  return {
    title: `${tournament.name} - TV Fase 2`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${tournament.name} - TV Fase 2`,
      description,
      url: `/torneos/${tournament.slug}/tvdark2`,
      locale: "es_ES",
    },
    alternates: {
      canonical: absoluteUrl(`/torneos/${tournament.slug}/tvdark2`),
    },
  };
}

function roundByNumber(rounds: RoundMatchesRound[], n: number, label: string): RoundMatchesRound {
  const found = rounds.find((r) => r.roundNumber === n);
  if (found) return { ...found, label };
  return { roundNumber: n, label, matches: [] };
}

/** Final round: first match = final, second = 3rd place (if present). */
function splitFinalRound(matches: RoundMatchRow[]): {
  final: RoundMatchRow[];
  third: RoundMatchRow[];
} {
  if (matches.length === 0) return { final: [], third: [] };
  if (matches.length === 1) return { final: [matches[0]], third: [] };
  return { final: [matches[0]], third: matches.slice(1) };
}

export default async function TournamentTvDark2Page({ params }: PageProps) {
  const { slug } = await params;
  const loaded = await fetchTournamentPageData(slug);
  if (!loaded.ok) {
    notFound();
  }
  const { roundMatchesRounds } = loaded.data;

  const quarters = roundByNumber(roundMatchesRounds, 4, "Cuartos de final");
  const semis = roundByNumber(roundMatchesRounds, 5, "Semifinales");
  const finalsRound = roundByNumber(roundMatchesRounds, 6, "Final");
  const { final: finalMatches, third: thirdMatches } = splitFinalRound(finalsRound.matches);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="tvdark2-knockout grid min-h-0 flex-1 grid-rows-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 overflow-hidden p-2 text-[length:clamp(0.72rem,1.15vw,1rem)] sm:gap-2 sm:p-3">
        <KnockoutTvRoundPanel
          title={quarters.label}
          headerColor={COLOR_QUARTERS}
          matches={quarters.matches}
          emptyLabel="Cuartos pendientes."
          layout="grid-2"
          uniformMatchHeight
          className="min-h-0"
        />

        <KnockoutTvRoundPanel
          title={semis.label}
          headerColor={COLOR_SEMIS}
          matches={semis.matches}
          emptyLabel="Semifinales pendientes."
          layout="grid-2"
          uniformMatchHeight
          className="min-h-0"
        />

        <div className="grid min-h-0 grid-cols-2 gap-1.5 sm:gap-2 [&>section]:min-h-0">
          <KnockoutTvRoundPanel
            title="Final"
            headerColor={COLOR_FINAL}
            matches={finalMatches}
            emptyLabel="Final pendiente."
            uniformMatchHeight
            className="min-h-0"
          />
          <KnockoutTvRoundPanel
            title="3er puesto"
            headerColor={COLOR_THIRD}
            matches={thirdMatches}
            emptyLabel="3er puesto pendiente."
            uniformMatchHeight
            className="min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
