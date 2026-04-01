import type { Metadata } from "next";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import {
  addPlayerToTournamentAction,
  removePlayerFromTournamentAction,
} from "@/app/admin/tournaments/[slug]/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import type { PlayerDbRow } from "@/lib/ranking/supabase-players";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  normalizeAdminTournamentStatus,
  type TournamentDbRow,
} from "@/lib/tournaments/supabase-list";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin torneo",
  robots: { index: false, follow: false },
};

const panel =
  "rounded-none border-4 border-[var(--color-primary)] bg-[var(--color-surface)] shadow-[5px_5px_0_var(--color-primary)]";

const linkBtn =
  "inline-flex w-full min-w-0 items-center justify-center col-span-1 rounded-none border-4 border-[var(--color-primary)] bg-[var(--color-muted)] px-2 py-2.5 text-center text-[0.5rem] uppercase leading-snug tracking-wide text-[var(--color-primary)] shadow-[3px_3px_0_var(--color-primary)] transition hover:brightness-[1.03] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-primary)] sm:text-[0.65rem] md:text-xs";

const submitBtn =
  "w-full rounded-none border-4 border-[var(--color-primary)] bg-[var(--color-accent-gold)] px-3 py-2.5 text-[0.55rem] uppercase leading-snug tracking-wide text-[var(--color-primary)] shadow-[3px_3px_0_var(--color-primary)] transition hover:brightness-[1.03] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-primary)] sm:w-auto sm:text-[0.65rem] md:text-xs";

const dangerBtn =
  "rounded-none border-4 border-red-900/80 bg-red-950/50 px-2 py-1.5 text-[0.45rem] uppercase leading-snug tracking-wide text-red-200 shadow-[2px_2px_0_rgba(127,29,29,0.6)] transition hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 sm:text-[0.55rem]";

const selectClass =
  "w-full min-w-0 rounded-none border-4 border-[var(--color-primary)] bg-background px-2 py-2.5 text-[0.55rem] text-[var(--color-primary)] outline-none sm:text-[0.65rem] md:text-xs";

const statusLabelBase =
  "inline-flex shrink-0 items-center rounded-none border-2 border-[var(--color-primary)] px-2 py-0.5 text-[0.45rem] uppercase leading-none sm:text-[0.5rem]";

function StatusLabel({ status }: { status: "open" | "finished" }) {
  if (status === "open") {
    return (
      <span className={`${statusLabelBase} bg-[var(--color-accent-gold)]/45 text-[var(--color-primary)]`}>
        Open
      </span>
    );
  }
  return (
    <span className={`${statusLabelBase} bg-[var(--color-muted)] text-[var(--color-subtle-text)]`}>
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

  const { data: allPlayersRows } = await supabase
    .from("players")
    .select("id, name, lastname, email, rating")
    .order("rating", { ascending: false });
  const allPlayers = (allPlayersRows ?? []) as Array<
    Pick<PlayerDbRow, "id" | "name" | "lastname" | "email" | "rating">
  >;
  const linkedPlayerIds = new Set(relations.map((r) => r.player_id));
  const availablePlayers = allPlayers.filter((p) => !linkedPlayerIds.has(p.id));

  return (
    <div className="flex w-full min-w-0 flex-col">
      <AdminNavbar />
    
        
       
      <div
        className={`mx-auto w-full min-w-0 max-w-4xl px-3 pb-10 pt-3 sm:px-4 sm:pb-12 sm:pt-4 ${pixel.className}`}
      >
       
       <h1 className="text-2xl font-black uppercase text-[var(--color-primary)]">{tournament.name}</h1>
       <h5 className="text-sm text-[var(--color-subtle-text)]">{tournament.status}</h5>

       
        <div className="mb-4 flex flex-row gap-2">
          <Link href={`/admin/tournaments/${slug}/teams`} className={linkBtn}>
            Equipos
          </Link>
          <Link href={`/admin/tournaments/${slug}/control`} className={linkBtn}>
            Control
          </Link>
          <Link href={`/admin/tournaments/${slug}/matches`} className={linkBtn}>
            Partidos
          </Link>
        </div>

        {uiError ? (
          <p
            className={`${panel} mb-4 border-amber-800 bg-amber-950/35 px-3 py-3 text-[0.55rem] leading-relaxed text-amber-100 sm:text-[0.65rem]`}
          >
            {uiError}
          </p>
        ) : null}
        {success ? (
          <p
            className={`${panel} mb-4 border-emerald-800 bg-emerald-950/35 px-3 py-3 text-[0.55rem] leading-relaxed text-emerald-100 sm:text-[0.65rem]`}
          >
            {success}
          </p>
        ) : null}

        <details className={`${panel} group mb-4`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-3 text-[0.55rem] font-normal uppercase leading-snug tracking-wide text-[var(--color-primary)] transition hover:bg-[var(--color-muted)]/35 sm:px-4 sm:py-3.5 sm:text-[0.65rem] md:text-xs [&::-webkit-details-marker]:hidden [&::marker]:content-none">
            <span>Informacion del torneo</span>
            <span
              className="inline-block shrink-0 text-[0.55rem] text-[var(--color-subtle-text)] transition-transform group-open:rotate-90"
              aria-hidden
            >
              ▶
            </span>
          </summary>
          <div className="space-y-2 border-t-4 border-[var(--color-primary)]/15 px-2 pb-3 pt-3 sm:px-3">
            <div className="flex flex-col gap-2 md:hidden">
              {entries.map(([label, value]) => (
                <div key={label} className={`${panel} p-2.5 sm:p-3`}>
                  <div className="mb-1 text-[0.45rem] uppercase leading-tight text-[var(--color-subtle-text)] sm:text-[0.5rem]">
                    {label}
                  </div>
                  <div className="break-words text-[0.5rem] leading-relaxed text-[var(--color-primary)] sm:text-[0.55rem]">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden min-w-0 overflow-x-auto md:block">
              <table className="w-full min-w-[min(100%,560px)] border-collapse text-left">
                <tbody>
                  {entries.map(([label, value]) => (
                    <tr key={label} className="border-t-4 border-[var(--color-primary)]/15 first:border-t-0">
                      <th className="w-40 bg-[var(--color-muted)] px-3 py-2.5 text-left text-[0.55rem] font-normal uppercase text-[var(--color-primary)] sm:w-48 sm:px-4 sm:text-[0.65rem] md:text-xs">
                        {label}
                      </th>
                      <td className="break-words px-3 py-2.5 text-[0.55rem] text-[var(--color-primary)] sm:px-4 sm:text-[0.65rem] md:text-xs">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <section className={`${panel} p-3 sm:p-4`}>
          <h2 className="mb-3 border-b-4 border-[var(--color-primary)]/20 pb-2 text-[0.55rem] font-normal uppercase leading-snug text-[var(--color-primary)] sm:text-[0.65rem] md:text-xs">
            Jugadores del torneo
          </h2>

          <form action={addPlayerToTournamentAction} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <select name="playerId" required className={`${selectClass} sm:min-w-0 sm:flex-1`}>
              <option value="">Jugador...</option>
              {availablePlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.lastname} {p.email ? `(${p.email})` : ""} · ELO {p.rating}
                </option>
              ))}
            </select>
            <button type="submit" className={submitBtn}>
              Anadir
            </button>
          </form>

          {relations.length === 0 ? (
            <p className="text-[0.5rem] leading-relaxed text-[var(--color-subtle-text)] sm:text-[0.55rem]">
              No hay jugadores inscritos.
            </p>
          ) : (
            <ul className="flex list-none flex-col gap-2">
              {relations.map((r) => (
                <li key={r.id}>
                  <div
                    className={`${panel} flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3`}
                  >
                    <div className="min-w-0 text-[0.5rem] leading-relaxed text-[var(--color-primary)] sm:text-[0.55rem] md:text-xs">
                      {(() => {
                        const player = getRelationPlayer(r.players);
                        return (
                          <>
                            {player ? `${player.name} ${player.lastname}` : `Jugador #${r.player_id}`}{" "}
                            <span className="text-[var(--color-subtle-text)]">({r.status})</span>
                          </>
                        );
                      })()}
                    </div>
                    <form action={removePlayerFromTournamentAction} className="shrink-0 sm:ml-2">
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="playerTournamentId" value={r.id} />
                      <button type="submit" className={dangerBtn}>
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
