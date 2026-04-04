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

const card = "rounded-xl border border-foreground/10 bg-surface shadow-sm";

function StatusLabel({ status }: { status: "open" | "finished" }) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200">
        Open
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-foreground/10 px-2 py-0.5 text-xs font-medium text-[color:var(--color-subtle-text)]">
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
    <div className="flex w-full min-w-0 flex-col">
      <AdminNavbar />

      <div className="mx-auto w-full min-w-0 max-w-4xl px-4 pb-12 pt-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="logo text-xl text-primary sm:text-2xl">{tournament.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-[color:var(--color-subtle-text)]">Estado:</span>
              <StatusLabel status={adminStatus} />
              <span className="text-sm text-[color:var(--color-subtle-text)]">
                ({tournament.status ?? "—"})
              </span>
            </div>
          </div>
          <Link
            href="/admin/tournaments"
            className="admin-link-btn"
          >
            Volver a torneos
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={`/admin/tournaments/${slug}/teams`} className="admin-link-btn">
            Equipos
          </Link>
          <Link href={`/admin/tournaments/${slug}/control`} className="admin-link-btn">
            Control
          </Link>
          <Link href={`/admin/tournaments/${slug}/matches`} className="admin-link-btn">
            Partidos
          </Link>
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

        <details className={`${card} group mb-6`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/50 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden [&::marker]:content-none">
            <span>Informacion del torneo</span>
            <span
              className="text-[color:var(--color-subtle-text)] transition-transform group-open:rotate-90"
              aria-hidden
            >
              ▶
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

        <section className={`${card} overflow-visible p-4 sm:p-6`}>
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
            <ul className="flex list-none flex-col gap-2">
              {relations.map((r) => (
                <li key={r.id}>
                  <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 bg-background/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div className="min-w-0 text-sm text-foreground">
                      {(() => {
                        const player = getRelationPlayer(r.players);
                        return (
                          <>
                            {player ? `${player.name} ${player.lastname}` : `Jugador #${r.player_id}`}{" "}
                            <span className="text-[color:var(--color-subtle-text)]">({r.status})</span>
                          </>
                        );
                      })()}
                    </div>
                    <form action={removePlayerFromTournamentAction} className="shrink-0 sm:ml-2">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="playerTournamentId" value={r.id} />
                      <button type="submit" className="admin-danger-btn">
                        Quitar
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
