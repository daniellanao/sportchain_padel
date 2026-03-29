import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchPlayerByIdFromSupabase } from "@/lib/ranking/supabase-players";
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
      className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
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

  const [{ data: matchRows }, { data: rpmRows }] = await Promise.all([
    supabase.from("rating_matches").select("id, played_at").in("id", matchIds),
    supabase
      .from("rating_match_players")
      .select("rating_match_id, side, role, is_winner, player_id")
      .in("rating_match_id", matchIds),
  ]);

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

  const { data: playerRows } =
    allPlayerIds.size > 0
      ? await supabase.from("players").select("id, name, lastname").in("id", [...allPlayerIds])
      : { data: [] as { id: number; name: string; lastname: string }[] | null };

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
  const matches = Number.isFinite(playerId) ? await fetchPlayerRatingHistoryFromSupabase(playerId) : [];
  const name = `${row.name} ${row.lastname}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link
          href="/ranking"
          className="navbar-text mb-6 inline-block border-2 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-4 py-2 text-xs uppercase text-white transition hover:brightness-110"
        >
          ← Volver al ranking
        </Link>

        <header className="mb-8 border-4 border-[var(--color-accent-gold)] bg-[var(--color-surface)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-6">
          <p className="navbar-text mb-1 text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">
            Jugador #{row.id}
          </p>
          <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
            {name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-subtle-text)]">
            <strong className="text-[var(--color-foreground)]">El pádel se juega en parejas:</strong>{" "}
            cada fila muestra <strong>tu compañero</strong> y <strong>los dos rivales</strong>.
            <strong className="text-[var(--color-foreground)]"> El ELO es individual</strong>: el
            cambio de puntos se calcula para ti, no para la pareja como bloque.
          </p>
          <dl className="mt-4 flex flex-wrap gap-6 text-sm">
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                ELO actual (individual)
              </dt>
              <dd className="navbar-text text-lg tabular-nums text-[var(--color-primary)]">
                {row.rating}
              </dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                Partidos jugados
              </dt>
              <dd className="font-medium tabular-nums">{row.matches_played}</dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                Partidos en historial
              </dt>
              <dd className="font-medium tabular-nums">{matches.length}</dd>
            </div>
          </dl>
        </header>

        <section>
          <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Historial de partidos (parejas)
          </h2>
          {matches.length === 0 ? (
            <p className="text-sm text-[var(--color-subtle-text)]">
              Todavía no hay partidos registrados para este jugador.
            </p>
          ) : (
            <div className="overflow-x-auto border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
              <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                    
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">Fecha</th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">
                      Compañero
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3">
                      Pareja rival
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3 text-center">Resultado</th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3 text-center">
                      ELO antes
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3 text-center">
                      ELO después
                    </th>
                    <th className="navbar-text whitespace-nowrap px-2 py-3 text-xs uppercase sm:px-3 text-center">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, index) => {
                    const delta = m.ratingAfter - m.ratingBefore;
                    return (
                      <tr
                        key={m.rowId || `m-${m.ratingMatchId}-${index}`}
                        className={
                          index % 2 === 0
                            ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                            : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                        }
                      >
                       
                        <td className="whitespace-nowrap px-2 py-2 text-[var(--color-foreground)] sm:px-3">
                          {formatDate(m.playedAt)}
                        </td>
                        <td className="min-w-[11rem] px-2 py-2 sm:px-3">
                          <div className="flex flex-col gap-1.5">
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">Tú</span>
                              <p className="font-semibold leading-tight text-[var(--color-foreground)]">{name}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">
                                Compañero
                              </span>
                              <p className="leading-tight">
                                {m.partner ? (
                                  <PlayerLink id={m.partner.id} label={m.partner.label} />
                                ) : (
                                  <span className="text-[var(--color-subtle-text)]">—</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="min-w-[11rem] px-2 py-2 sm:px-3">
                          <div className="flex flex-col gap-1.5">
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">
                                Rival 1
                              </span>
                              <p className="leading-tight">
                                {m.opponents[0] ? (
                                  <PlayerLink id={m.opponents[0].id} label={m.opponents[0].label} />
                                ) : (
                                  <span className="text-[var(--color-subtle-text)]">—</span>
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-[var(--color-subtle-text)]">
                                Rival 2
                              </span>
                              <p className="leading-tight">
                                {m.opponents[1] ? (
                                  <PlayerLink id={m.opponents[1].id} label={m.opponents[1].label} />
                                ) : (
                                  <span className="text-[var(--color-subtle-text)]">—</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 sm:px-3 text-center">
                          {m.result == null ? (
                            <span className="text-[var(--color-subtle-text)]">—</span>
                          ) : (
                            <span
                              className={
                                m.result === "win"
                                  ? "font-bold text-emerald-700 dark:text-emerald-400"
                                  : "font-bold text-rose-700 dark:text-rose-400"
                              }
                            >
                              {m.result === "win" ? "V" : "D"}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 tabular-nums text-[var(--color-subtle-text)] sm:px-3 text-center">
                          {m.ratingBefore}
                        </td>
                        <td className="navbar-text px-2 py-2 tabular-nums text-[var(--color-primary)] sm:px-3 text-center">
                          {m.ratingAfter}
                        </td>
                        <td
                          className={`px-2 py-2 tabular-nums sm:px-3 text-center ${
                            delta >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
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
