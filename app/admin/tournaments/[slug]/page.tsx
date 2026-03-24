import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import {
  addPlayerToTournamentAction,
  removePlayerFromTournamentAction,
} from "@/app/admin/tournaments/[slug]/actions";
import type { PlayerDbRow } from "@/lib/ranking/supabase-players";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TournamentDbRow } from "@/lib/tournaments/supabase-list";

export const metadata: Metadata = {
  title: "Admin torneo",
  robots: { index: false, follow: false },
};

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
    ["Name", t.name],
    ["Slug", t.slug ?? "—"],
    ["Format", t.format ?? "—"],
    ["Status", t.status ?? "—"],
    ["Location", t.location ?? "—"],
    ["Start date", formatDateTime(t.start_date)],
    ["End date", formatDateTime(t.end_date)],
    ["Max teams", t.max_teams != null ? String(t.max_teams) : "—"],
    ["Total rounds", t.total_rounds != null ? String(t.total_rounds) : "—"],
    ["Description", t.description ?? "—"],
    ["Image", t.image ?? "—"],
    ["Created at", formatDateTime(t.created_at)],
    ["Updated at", formatDateTime(t.updated_at)],
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
    <div className="w-full max-w-4xl rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Admin / Tournament</h1>
        <Link
          href="/admin/tournaments"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Volver a torneos
        </Link>
      </div>

      <p className="mb-4 text-sm text-[color:var(--color-subtle-text)]">
        Informacion completa del torneo.
      </p>
      <p className="mb-4 text-sm">
        <Link href={`/admin/tournaments/${slug}/teams`} className="text-primary underline-offset-4 hover:underline">
          Gestionar equipos
        </Link>
      </p>
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

      <div className="overflow-hidden rounded-lg border border-foreground/10">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {rowEntries(tournament).map(([label, value]) => (
              <tr key={label} className="border-t border-foreground/10 first:border-t-0">
                <th className="w-44 bg-[var(--color-muted)] px-4 py-2 font-semibold text-foreground">
                  {label}
                </th>
                <td className="px-4 py-2 break-all">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-6 rounded-lg border border-foreground/10 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Gestionar jugadores del torneo
        </h2>

        <form action={addPlayerToTournamentAction} className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <select
            name="playerId"
            required
            className="min-w-0 flex-1 rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="">Seleccionar jugador...</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.lastname} {p.email ? `(${p.email})` : ""} - ELO {p.rating}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Anadir
          </button>
        </form>

        {relations.length === 0 ? (
          <p className="text-sm text-[color:var(--color-subtle-text)]">No hay jugadores inscritos.</p>
        ) : (
          <ul className="space-y-2">
            {relations.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-foreground/10 px-3 py-2 text-sm"
              >
                {(() => {
                  const player = getRelationPlayer(r.players);
                  return (
                    <span>
                      {player ? `${player.name} ${player.lastname}` : `Player #${r.player_id}`}{" "}
                      <span className="text-[color:var(--color-subtle-text)]">({r.status})</span>
                    </span>
                  );
                })()}
                <form action={removePlayerFromTournamentAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="playerTournamentId" value={r.id} />
                  <button
                    type="submit"
                    className="rounded border border-red-400/40 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
