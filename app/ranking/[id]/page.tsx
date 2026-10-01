import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { EloEvolutionChart, type EloPoint } from "@/components/ranking/EloEvolutionChart";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchPlayerByIdFromSupabase, fetchRankingPositionFromSupabase } from "@/lib/ranking/supabase-players";
import { absoluteUrl } from "@/lib/site-config";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchPlayerByIdFromSupabase(id);
  if (!row) {
    return { title: "Jugador" };
  }
  const name = `${row.name} ${row.lastname}`;
  const description = `Historial de partidos y evolución ELO individual de ${name} en el ranking Sportchain Padel (pádel en parejas).`;
  return {
    title: name,
    description,
    openGraph: {
      title: `${name} — historial y ELO`,
      description,
      url: `/ranking/${row.id}`,
      locale: "es_ES",
    },
    alternates: {
      canonical: absoluteUrl(`/ranking/${row.id}`),
    },
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function PlayerLink({ id, label }: { id: number; label: string }) {
  return (
    <Link
      href={`/ranking/${id}`}
      className="font-semibold text-black underline-offset-2 hover:underline"
    >
      {label}
    </Link>
  );
}

type RatingHistoryRow = {
  rowId: string;
  ratingMatchId: number;
  playedAt: string;
  /** Desde `is_winner` en rating_match_players; si no hay filas, se infiere por `rating_change`. */
  result: "win" | "loss" | null;
  partner: { id: number; label: string } | null;
  opponents: Array<{ id: number; label: string }>;
  ratingBefore: number;
  ratingAfter: number;
};

function playerLabel(p: { name: string | null; lastname: string | null } | null | undefined): string {
  const name = String(p?.name ?? "").trim();
  const lastname = String(p?.lastname ?? "").trim();
  const full = `${name} ${lastname}`.trim();
  return full || "Jugador";
}

function resultFromRpmOrChange(
  me: { is_winner: boolean } | null,
  ratingChange: number,
): "win" | "loss" | null {
  if (me) return me.is_winner ? "win" : "loss";
  if (ratingChange > 0) return "win";
  if (ratingChange < 0) return "loss";
  return null;
}

type RpmRow = {
  rating_match_id: number;
  side: number;
  role: number;
  is_winner: boolean;
  player_id: number;
};

/**
 * Sin embeds anidados: evita que PostgREST/RLS devuelva `rating_matches` vacío y se pierdan todas las filas.
 */
async function fetchPlayerRatingHistoryFromSupabase(playerId: number): Promise<RatingHistoryRow[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data: logs, error: logsError } = await supabase
    .from("rating_logs")
    .select("id, rating_match_id, rating_before, rating_after, rating_change, created_at")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (logsError || !logs?.length) return [];

  const matchIds = [
    ...new Set(
      logs
        .map((l) => Number((l as { rating_match_id: unknown }).rating_match_id))
        .filter((n) => Number.isFinite(n)),
    ),
  ];

  // PostgREST devuelve como máximo 1000 filas por petición (p. ej. 250+ partidos × 4 jugadores).
  const matchRows: Array<{ id: unknown; played_at: string | null }> = [];
  const rpmRows: RpmRow[] = [];
  const MATCH_ID_CHUNK = 80;
  for (let i = 0; i < matchIds.length; i += MATCH_ID_CHUNK) {
    const chunk = matchIds.slice(i, i + MATCH_ID_CHUNK);
    const [{ data: matchesChunk }, { data: rpmChunk }] = await Promise.all([
      supabase.from("rating_matches").select("id, played_at").in("id", chunk),
      supabase
        .from("rating_match_players")
        .select("rating_match_id, side, role, is_winner, player_id")
        .in("rating_match_id", chunk),
    ]);
    if (matchesChunk) matchRows.push(...matchesChunk);
    if (rpmChunk) rpmRows.push(...(rpmChunk as RpmRow[]));
  }

  const playedAtByMatchId = new Map<number, string>();
  for (const m of matchRows ?? []) {
    const mid = Number((m as { id: unknown }).id);
    const raw = (m as { played_at: string | null }).played_at;
    playedAtByMatchId.set(mid, raw ? String(raw) : "");
  }

  const rpmByMatchId = new Map<number, RpmRow[]>();
  for (const row of rpmRows ?? []) {
    const r = row as RpmRow;
    const mid = Number(r.rating_match_id);
    const list = rpmByMatchId.get(mid) ?? [];
    list.push(r);
    rpmByMatchId.set(mid, list);
  }

  const allPlayerIds = new Set<number>();
  for (const row of rpmRows ?? []) {
    allPlayerIds.add(Number((row as RpmRow).player_id));
  }

  const playerRows: { id: number; name: string; lastname: string }[] = [];
  const playerIdList = [...allPlayerIds];
  const PLAYER_ID_CHUNK = 200;
  for (let i = 0; i < playerIdList.length; i += PLAYER_ID_CHUNK) {
    const chunk = playerIdList.slice(i, i + PLAYER_ID_CHUNK);
    const { data } = await supabase.from("players").select("id, name, lastname").in("id", chunk);
    if (data) playerRows.push(...data);
  }

  const labelById = new Map<number, string>();
  for (const p of playerRows ?? []) {
    labelById.set(Number(p.id), playerLabel(p));
  }

  const normalized: RatingHistoryRow[] = [];

  for (const log of logs as Array<{
    id: unknown;
    rating_match_id: unknown;
    rating_before: unknown;
    rating_after: unknown;
    rating_change: unknown;
    created_at: string | null;
  }>) {
    const rowId = String(log.id ?? "");
    const matchId = Number(log.rating_match_id);
    const change = Number(log.rating_change);
    const rpm = rpmByMatchId.get(matchId) ?? [];
    const playedFromMatch = playedAtByMatchId.get(matchId);
    const playedAt =
      playedFromMatch && playedFromMatch.length > 0
        ? playedFromMatch
        : log.created_at
          ? String(log.created_at)
          : new Date().toISOString();

    const me = rpm.find((x) => Number(x.player_id) === playerId) ?? null;

    let partner: { id: number; label: string } | null = null;
    let opponents: Array<{ id: number; label: string }> = [];

    if (me) {
      const mySide = Number(me.side);
      const partnerRow =
        rpm.find((x) => Number(x.side) === mySide && Number(x.player_id) !== playerId) ?? null;
      if (partnerRow) {
        const pid = Number(partnerRow.player_id);
        partner = { id: pid, label: labelById.get(pid) ?? `Jugador #${pid}` };
      }
      opponents = rpm
        .filter((x) => Number(x.side) !== mySide)
        .map((x) => {
          const pid = Number(x.player_id);
          return { id: pid, label: labelById.get(pid) ?? `Jugador #${pid}` };
        })
        .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
    }

    normalized.push({
      rowId,
      ratingMatchId: matchId,
      playedAt,
      result: resultFromRpmOrChange(me, change),
      partner,
      opponents,
      ratingBefore: Number(log.rating_before),
      ratingAfter: Number(log.rating_after),
    });
  }

  normalized.sort((a, b) => {
    const da = Date.parse(a.playedAt);
    const db = Date.parse(b.playedAt);
    if (Number.isFinite(da) && Number.isFinite(db) && da !== db) return db - da;
    return b.ratingMatchId - a.ratingMatchId;
  });

  return normalized;
}

export default async function PlayerHistoryPage({ params }: PageProps) {
  const { id } = await params;
  const row = await fetchPlayerByIdFromSupabase(id);
  if (!row) {
    notFound();
  }

  const playerId = Number(id);
  const [matches, position] = await Promise.all([
    Number.isFinite(playerId) ? fetchPlayerRatingHistoryFromSupabase(playerId) : Promise.resolve([]),
    fetchRankingPositionFromSupabase(row.rating),
  ]);
  const name = `${row.name} ${row.lastname}`;

  const wins = matches.filter((m) => m.result === "win").length;
  const decided = matches.filter((m) => m.result != null).length;
  const winRate = decided > 0 ? Math.round((wins / decided) * 100) : null;
  const tournamentsWon = row.stars ?? 0;

  const chronological = [...matches].reverse();
  const eloPoints: EloPoint[] =
    chronological.length > 0
      ? [
          { date: chronological[0].playedAt, elo: chronological[0].ratingBefore },
          ...chronological.map((m) => ({ date: m.playedAt, elo: m.ratingAfter })),
        ]
      : [];
  const eloValues = eloPoints.map((p) => p.elo);
  const peakElo = eloValues.length > 0 ? Math.max(...eloValues) : null;
  const lowestElo = eloValues.length > 0 ? Math.min(...eloValues) : null;

  const stats: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: "ELO", value: String(row.rating), highlight: true },
    {
      label: "Posición",
      value: position != null ? `#${position}` : "—",
      highlight: position === 1,
    },
    { label: "Partidos", value: String(row.matches_played) },
    { label: "Victorias", value: String(wins) },
    { label: "% Victorias", value: winRate != null ? `${winRate}%` : "—" },
    { label: "Torneos ganados", value: String(tournamentsWon) },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-5xl py-8 sm:py-10">
          <Link
            href="/ranking"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/60 transition hover:text-white"
          >
            ← Ranking
          </Link>

          <div className="mt-6 text-center">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
              Jugador
            </p>
            <h1 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
              {name}
            </h1>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-black/40 px-3 py-4 text-center">
                <dt className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/60">{s.label}</dt>
                <dd
                  className={`mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl ${
                    s.highlight ? "text-[#E3C273]" : "text-white"
                  }`}
                >
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <section className="mb-10 rounded-lg border border-black/10 bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-black">Evolución del ELO</h2>
            {peakElo != null && lowestElo != null ? (
              <dl className="flex gap-5 text-xs">
                <div className="flex items-baseline gap-1.5">
                  <dt className="font-bold uppercase tracking-[0.12em] text-[var(--color-subtle-text)]">Máx.</dt>
                  <dd className="text-base font-extrabold tabular-nums text-black">{peakElo}</dd>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <dt className="font-bold uppercase tracking-[0.12em] text-[var(--color-subtle-text)]">Mín.</dt>
                  <dd className="text-base font-extrabold tabular-nums text-black">{lowestElo}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <EloEvolutionChart points={eloPoints} />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-extrabold uppercase tracking-tight text-black">Historial de partidos</h2>
          {matches.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">
              Todavía no hay partidos registrados para este jugador.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-black/10 shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Fecha
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Compañero
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Pareja rival
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Resultado
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      ELO
                    </th>
                    <th className="whitespace-nowrap px-3 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
                      Δ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, index) => {
                    const delta = m.ratingAfter - m.ratingBefore;
                    return (
                      <tr
                        key={m.rowId || `m-${m.ratingMatchId}-${index}`}
                        className="border-t border-black/5 bg-[var(--color-surface)] transition-colors even:bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)]"
                      >
                        <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[var(--color-subtle-text)]">
                          {formatDate(m.playedAt)}
                        </td>
                        <td className="px-3 py-2.5">
                          {m.partner ? (
                            <PlayerLink id={m.partner.id} label={m.partner.label} />
                          ) : (
                            <span className="text-[var(--color-subtle-text)]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {m.opponents.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {m.opponents.map((o) => (
                                <PlayerLink key={o.id} id={o.id} label={o.label} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-[var(--color-subtle-text)]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {m.result == null ? (
                            <span className="text-[var(--color-subtle-text)]">—</span>
                          ) : (
                            <span
                              className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-extrabold ${
                                m.result === "win"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                              title={m.result === "win" ? "Victoria" : "Derrota"}
                            >
                              {m.result === "win" ? "V" : "D"}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-center tabular-nums">
                          <span className="text-[var(--color-subtle-text)]">{m.ratingBefore}</span>
                          <span className="mx-1 text-[var(--color-subtle-text)]" aria-hidden>
                            →
                          </span>
                          <span className="font-extrabold text-black">{m.ratingAfter}</span>
                        </td>
                        <td
                          className={`px-3 py-2.5 text-center font-bold tabular-nums ${
                            delta > 0
                              ? "text-emerald-700"
                              : delta < 0
                                ? "text-rose-700"
                                : "text-[var(--color-subtle-text)]"
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
