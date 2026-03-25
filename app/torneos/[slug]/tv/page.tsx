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
  const description = `${tournament.name}: ${tournament.dateLabel}, ${tournament.timeLabel}. ${formatTournamentFormatLabel(tournament)}. Pantalla TV.`;
  return {
    title: `${tournament.name} — TV`,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${tournament.name} — TV`,
      description,
      url: `/torneos/${tournament.slug}/tv`,
      locale: "es_ES",
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
  const { tournament, standingsRows, roundMatchesRounds } = loaded.data;

  const round1 = roundByNumber(roundMatchesRounds, 1);
  const round2 = roundByNumber(roundMatchesRounds, 2);
  const round3 = roundByNumber(roundMatchesRounds, 3);
  const round4 = roundByNumber(roundMatchesRounds, 4);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-2 py-1 text-white sm:px-3 sm:py-1.5">
        <h1 className="truncate text-center text-[clamp(0.65rem,1.2vw,0.95rem)] font-black uppercase leading-tight tracking-wide">
          {tournament.name}
        </h1>
        <p className="mt-0.5 text-center text-[clamp(0.48rem,0.85vw,0.7rem)] text-white/85">
          {tournament.dateLabel} · {formatTournamentFormatLabel(tournament)}
        </p>
      </header>

      {/* Left: standings full viewport height (not half a row). Right: 2×2 rounds, each cell scrolls if needed. */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5 sm:gap-2 sm:p-2 lg:flex-row lg:gap-2">
        <div className="flex min-h-0 w-full min-w-0 flex-col lg:w-[40%] lg:max-w-[40%] lg:flex-[0_0_40%]">
          <div
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 text-[length:clamp(0.44rem,0.78vw,0.74rem)] leading-none [&_tbody_td]:py-px [&_thead_th]:py-px [&_tr]:leading-none"
          >
            <StandingsTable rows={standingsRows} title="Standings" compact />
          </div>
        </div>

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-4 gap-1 overflow-hidden text-[length:clamp(0.36rem,0.62vw,0.58rem)] sm:gap-1 lg:grid-cols-2 lg:grid-rows-2 lg:gap-x-2 lg:gap-y-1 lg:text-[length:clamp(0.38rem,0.65vw,0.62rem)]">
          <div className="min-h-0 overflow-y-auto overflow-x-hidden lg:min-h-0">
            <RoundMatches rounds={[round1]} title="" compact />
          </div>
          <div className="min-h-0 overflow-y-auto overflow-x-hidden lg:min-h-0">
            <RoundMatches rounds={[round2]} title="" compact />
          </div>
          <div className="min-h-0 overflow-y-auto overflow-x-hidden lg:min-h-0">
            <RoundMatches rounds={[round3]} title="" compact />
          </div>
          <div className="min-h-0 overflow-y-auto overflow-x-hidden lg:min-h-0">
            <RoundMatches rounds={[round4]} title="" compact />
          </div>
        </div>
      </div>
    </div>
  );
}
