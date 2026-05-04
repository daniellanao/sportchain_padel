import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import {
  processRatingMatchEloAction,
  updateRatingMatchPlayersAction,
} from "@/app/admin/rating-matches/[id]/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rating match",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type RatingMatchRow = {
  id: number;
  tournament_id: number | null;
  source_match_id: number | null;
  played_at: string;
  status: string;
};

type RatingMatchPlayerRow = {
  id: number;
  player_id: number;
  side: number;
  role: number;
  is_winner: boolean;
};

type PlayerOption = {
  id: number;
  name: string;
  lastname: string;
  rating: number;
};

function formatPlayedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

function roleLabel(role: number): string {
  return role === 1 ? "Jugador 1" : role === 2 ? "Jugador 2" : `Rol ${role}`;
}

export default async function AdminRatingMatchDetailPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error: uiError, success } = await searchParams;

  const { id: idParam } = await params;
  const id = Number(String(idParam ?? "").trim());
  if (!Number.isInteger(id) || id <= 0) notFound();

  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data, error } = await supabase
    .from("rating_matches")
    .select("id, tournament_id, source_match_id, played_at, status")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();

  const row = data as RatingMatchRow;

  let tournamentMatchesHref: string | null = null;
  if (row.tournament_id != null) {
    const { data: tournamentRow } = await supabase
      .from("tournaments")
      .select("slug")
      .eq("id", row.tournament_id)
      .maybeSingle();
    const slug = (tournamentRow as { slug: string | null } | null)?.slug?.trim();
    if (slug) tournamentMatchesHref = `/admin/tournaments/${slug}/matches`;
  }

  const { data: rpmData } = await supabase
    .from("rating_match_players")
    .select("id, player_id, side, role, is_winner")
    .eq("rating_match_id", id)
    .order("side", { ascending: true })
    .order("role", { ascending: true });

  const rpmRows = (rpmData ?? []) as RatingMatchPlayerRow[];
  const canEditPlayers = rpmRows.length === 4;

  const { count: eloLogCount } = await supabase
    .from("rating_logs")
    .select("id", { count: "exact", head: true })
    .eq("rating_match_id", id);
  const eloLogsExist = (eloLogCount ?? 0) > 0;

  const ratingStatusNorm = String(row.status ?? "")
    .trim()
    .toLowerCase();
  const ratingProcessed = ratingStatusNorm === "processed";
  const eloInconsistentState =
    ratingStatusNorm === "processing_elo" && eloLogsExist;
  const canProcessElo =
    rpmRows.length === 4 &&
    !eloLogsExist &&
    !ratingProcessed &&
    (ratingStatusNorm === "valid" || ratingStatusNorm === "processing_elo");

  const { data: playersData } = await supabase
    .from("players")
    .select("id, name, lastname, rating")
    .order("rating", { ascending: false });
  const players = (playersData ?? []) as PlayerOption[];

  const entries: Array<[string, string]> = [
    ["id", String(row.id)],
    ["tournament_id", row.tournament_id != null ? String(row.tournament_id) : "—"],
    ["source_match_id", row.source_match_id != null ? String(row.source_match_id) : "—"],
    ["played_at", formatPlayedAt(row.played_at)],
    ["status", row.status || "—"],
  ];

  const winnerRow = rpmRows.find((r) => r.is_winner);
  const winningSideDefault = winnerRow != null && Number(winnerRow.side) === 2 ? 2 : 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Rating match</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {tournamentMatchesHref ? (
            <Link
              href={tournamentMatchesHref}
              className="text-primary underline-offset-4 hover:underline"
            >
              Partidos del torneo
            </Link>
          ) : null}
          <Link href="/admin/tournaments" className="text-primary underline-offset-4 hover:underline">
            Torneos
          </Link>
        </div>
      </div>

      {uiError ? (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {uiError}
        </p>
      ) : null}
      {success ? (
        <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {success}
        </p>
      ) : null}

      <div className="mb-8 overflow-hidden rounded-lg border border-foreground/10">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {entries.map(([label, value]) => (
              <tr key={label} className="border-t border-foreground/10 first:border-t-0">
                <th className="w-40 bg-[var(--color-muted)] px-4 py-2 font-semibold text-foreground">
                  {label}
                </th>
                <td className="px-4 py-2 break-all font-mono text-xs">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mb-8 rounded-lg border border-foreground/10 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Elo
        </h2>
        {ratingProcessed ? (
          <p className="text-sm text-[color:var(--color-subtle-text)]">
            Este rating match ya fue procesado (Elo aplicado y registrado en rating_logs).
          </p>
        ) : eloInconsistentState ? (
          <p className="text-sm text-amber-200">
            Estado <span className="font-mono">processing_elo</span> con registros en{" "}
            <span className="font-mono">rating_logs</span>: datos incoherentes. Revisa Supabase.
          </p>
        ) : !canProcessElo ? (
          <p className="text-sm text-[color:var(--color-subtle-text)]">
            {eloLogsExist
              ? "Hay entradas en rating_logs; no se puede volver a procesar desde aquí."
              : rpmRows.length !== 4
                ? "Hacen falta 4 jugadores en rating_match_players para procesar Elo."
                : "No se puede procesar Elo con el estado actual."}
          </p>
        ) : (
          <form action={processRatingMatchEloAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="ratingMatchId" value={row.id} />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Process Elo
            </button>
            <span className="text-xs text-[color:var(--color-subtle-text)]">
              K=32, promedio por lado, mismo delta para ambos jugadores del mismo lado.
            </span>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-foreground/10 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Jugadores (rating_match_players)
        </h2>

        {!canEditPlayers ? (
          <p className="text-sm text-[color:var(--color-subtle-text)]">
            Se esperaban 4 filas; hay {rpmRows.length}. Edición deshabilitada.
          </p>
        ) : (
          <form action={updateRatingMatchPlayersAction} className="space-y-4">
            <input type="hidden" name="ratingMatchId" value={row.id} />

            <label className="flex max-w-xs flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">Equipo ganador</span>
              <span className="text-xs text-[color:var(--color-subtle-text)]">
                Asigna is_winner a los dos jugadores de ese lado (lado 1 o 2).
              </span>
              <select
                name="winnerSide"
                defaultValue={String(winningSideDefault)}
                className="mt-1 rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
              >
                <option value="1">Lado 1</option>
                <option value="2">Lado 2</option>
              </select>
            </label>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 bg-[var(--color-muted)]">
                    <th className="px-3 py-2 font-semibold">Lado</th>
                    <th className="px-3 py-2 font-semibold">Rol</th>
                    <th className="px-3 py-2 font-semibold">Jugador</th>
                  </tr>
                </thead>
                <tbody>
                  {rpmRows.map((r, i) => (
                    <tr
                      key={r.id}
                      className={
                        i % 2 === 0
                          ? "border-t border-foreground/10 bg-[var(--color-surface)]"
                          : "border-t border-foreground/10 bg-[var(--color-muted)]/25"
                      }
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-mono tabular-nums">{r.side}</td>
                      <td className="whitespace-nowrap px-3 py-2">{roleLabel(r.role)}</td>
                      <td className="px-3 py-2">
                        <input type="hidden" name="rowId" value={r.id} />
                        <select
                          name="playerId"
                          defaultValue={String(r.player_id)}
                          className="w-full min-w-[200px] rounded-lg border border-foreground/15 bg-background px-2 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
                        >
                          {players.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.lastname} · ELO {p.rating}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Guardar jugadores
              </button>
            </div>
          </form>
        )}
      </section>
        </div>
      </main>
    </div>
  );
}
