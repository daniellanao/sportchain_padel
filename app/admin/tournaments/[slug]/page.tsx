import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import {
  addPlayerToTournamentAction,
  removePlayerFromTournamentAction,
} from "@/app/admin/tournaments/[slug]/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { PlayerSearchPicker } from "@/components/admin/PlayerSearchPicker";
import type { PlayerDbRow } from "@/lib/ranking/supabase-players";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  normalizeAdminTournamentStatus,
  type TournamentDbRow,
} from "@/lib/tournaments/supabase-list";

export const metadata: Metadata = {
  title: "Admin torneo",
  robots: { index: false, follow: false },
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

const rowLinkClass =
  "navbar-text btn-gold inline-flex min-h-[44px] items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-4 py-2.5 text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:opacity-95 active:brightness-95 sm:min-w-[7.5rem]";

const cardClass = "rounded-xl border border-foreground/10 bg-surface shadow-sm";

const statusLabelBase =
  "inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-wide";

function StatusLabel({ status }: { status: "open" | "finished" }) {
  if (status === "open") {
    return (
      <span
        className={`${statusLabelBase} border-emerald-600/40 bg-emerald-500/10 text-emerald-900 dark:border-emerald-400/45 dark:bg-emerald-400/10 dark:text-emerald-200`}
      >
        Open
      </span>
    );
  }
  return (
    <span
      className={`${statusLabelBase} border-foreground/20 bg-muted text-[color:var(--color-subtle-text)]`}
    >
      Finished
    </span>
  );
}

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type RelationPlayer = Pick<PlayerDbRow, "id" | "name" | "lastname" | "email" | "rating">;

type TournamentPlayerRelation = {
  id: number;
  player_id: number;
  status: string;
  created_at: string | null;
  players: RelationPlayer | RelationPlayer[] | null;
};

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("es-ES");
}

function getRelationPlayer(value: TournamentPlayerRelation["players"]): RelationPlayer | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function rowEntries(t: TournamentDbRow): Array<[string, string]> {
  return [
    ["ID", String(t.id)],
    ["Nombre", t.name],
    ["Slug", t.slug ?? "—"],
    ["Formato", t.format ?? "—"],
    ["Estado (DB)", t.status ?? "—"],
    ["Ubicacion", t.location ?? "—"],
    ["Inicio", formatDateTime(t.start_date)],
    ["Fin", formatDateTime(t.end_date)],
    ["Max equipos", t.max_teams != null ? String(t.max_teams) : "—"],
    ["Rondas", t.total_rounds != null ? String(t.total_rounds) : "—"],
    ["Descripcion", t.description ?? "—"],
    ["Imagen", t.image ?? "—"],
    ["Creado", formatDateTime(t.created_at)],
    ["Actualizado", formatDateTime(t.updated_at)],
  ];
}

export default async function AdminTournamentDetailPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error: uiError, success } = await searchParams;
  const { slug } = await params;
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    notFound();
  }

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const tournament = data as TournamentDbRow;
  const adminStatus = normalizeAdminTournamentStatus(tournament);
  const entries = rowEntries(tournament);

  const { data: joinedRows } = await supabase
    .from("player_tournament")
    .select("id, player_id, status, created_at, players(id, name, lastname, email, rating)")
    .eq("tournament_id", tournament.id)
    .order("created_at", { ascending: true });

  const relations = (joinedRows ?? []) as TournamentPlayerRelation[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <div className="min-w-0 max-w-3xl px-1">
            <h1 className="logo text-2xl text-primary sm:text-3xl">{tournament.name}</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-[color:var(--color-subtle-text)]">Estado:</span>
              <StatusLabel status={adminStatus} />
              <span className="text-sm text-[color:var(--color-subtle-text)]">
                ({tournament.status ?? "—"})
              </span>
            </div>
          </div>

          <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/admin/tournaments" className={adminCtaClass}>
              Volver a torneos
            </Link>
            <Link href={`/admin/tournaments/${slug}/teams`} className={rowLinkClass}>
              Equipos
            </Link>
            <Link href={`/admin/tournaments/${slug}/control`} className={rowLinkClass}>
              Control
            </Link>
            <Link href={`/admin/tournaments/${slug}/matches`} className={rowLinkClass}>
              Partidos
            </Link>
          </div>
        </div>

        {uiError ? (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {uiError}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            {success}
          </p>
        ) : null}

        <details className={`${cardClass} group mb-6`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/50 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden [&::marker]:content-none">
            <span>Informacion del torneo</span>
            <span
              className="inline-flex shrink-0 text-[color:var(--color-subtle-text)] transition-transform duration-200 group-open:rotate-90"
              aria-hidden
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
          </summary>
          <div className="space-y-3 border-t border-foreground/10 px-3 pb-4 pt-3 sm:px-4">
            <div className="flex flex-col gap-3 md:hidden">
              {entries.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-foreground/10 bg-background/50 p-3">
                  <div className="mb-1 text-xs font-medium text-[color:var(--color-subtle-text)]">
                    {label}
                  </div>
                  <div className="break-words text-sm text-foreground">{value}</div>
                </div>
              ))}
            </div>

            <div className="hidden min-w-0 overflow-x-auto md:block">
              <table className="w-full min-w-[min(100%,560px)] border-collapse text-left text-sm">
                <tbody>
                  {entries.map(([label, value]) => (
                    <tr key={label} className="border-t border-foreground/10 first:border-t-0">
                      <th className="w-40 bg-muted/50 px-4 py-2.5 font-semibold text-foreground sm:w-48">
                        {label}
                      </th>
                      <td className="break-words px-4 py-2.5 text-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <section className={`${cardClass} overflow-visible p-4 sm:p-6`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Jugadores del torneo
          </h2>

          <form action={addPlayerToTournamentAction} className="mb-6">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <p className="mb-3 text-sm text-[color:var(--color-subtle-text)]">
              Busca por texto o ID; solo se cargan coincidencias (max. 25), sin listar toda la base.
            </p>
            <PlayerSearchPicker tournamentId={tournament.id} submitClassName="admin-submit-btn" />
          </form>

          {relations.length === 0 ? (
            <p className="text-sm text-[color:var(--color-subtle-text)]">No hay jugadores inscritos.</p>
          ) : (
            <>
              <p className="mb-2 text-xs text-[color:var(--color-subtle-text)]">
                <span className="tabular-nums font-medium text-foreground">{relations.length}</span>{" "}
                {relations.length === 1 ? "jugador inscrito" : "jugadores inscritos"}.
              </p>
              <div className="overflow-hidden rounded-lg border border-foreground/10">
                <div className="max-h-[min(55vh,480px)] overflow-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
                      <tr>
                        <th className="w-10 whitespace-nowrap px-2 py-2.5 text-center font-semibold tabular-nums text-[color:var(--color-subtle-text)]">
                          #
                        </th>
                        <th className="px-3 py-2.5 font-semibold text-[color:var(--color-subtle-text)]">
                          Jugador
                        </th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-[color:var(--color-subtle-text)]">
                          Rating
                        </th>
                        <th className="w-px whitespace-nowrap px-3 py-2.5 text-right font-semibold text-[color:var(--color-subtle-text)]">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relations.map((r, index) => {
                        const player = getRelationPlayer(r.players);
                        const label = player
                          ? `${player.name} ${player.lastname}`
                          : `Jugador #${r.player_id}`;
                        return (
                          <tr
                            key={r.id}
                            className="border-b border-foreground/5 last:border-0 hover:bg-muted/40"
                          >
                            <td className="px-2 py-2 text-center align-middle tabular-nums text-[color:var(--color-subtle-text)]">
                              {index + 1}
                            </td>
                            <td className="max-w-[14rem] truncate px-3 py-2 align-middle font-medium text-foreground" title={label}>
                              {label}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right align-middle tabular-nums font-medium text-foreground">
                              {player != null && player.rating != null ? player.rating : "—"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right align-middle">
                              <form action={removePlayerFromTournamentAction} className="inline">
                                <input type="hidden" name="slug" value={slug} />
                                <input type="hidden" name="playerTournamentId" value={r.id} />
                                <button type="submit" className="admin-danger-btn text-xs">
                                  Quitar
                                </button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
