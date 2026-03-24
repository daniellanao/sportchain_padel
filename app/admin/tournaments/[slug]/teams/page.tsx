import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import {
  createTeamAction,
  deleteTeamAction,
  updateTeamAction,
} from "@/app/admin/tournaments/[slug]/teams/actions";
import type { PlayerDbRow } from "@/lib/ranking/supabase-players";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TournamentDbRow } from "@/lib/tournaments/supabase-list";

export const metadata: Metadata = {
  title: "Admin equipos",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type TeamRow = {
  id: number;
  player1_id: number;
  player2_id: number;
  team_name: string | null;
  status: string;
  average_rating: number;
  points: number;
  wins: number;
  losses: number;
  matches_played: number;
  final_position: number | null;
};

function playerLabel(p: Pick<PlayerDbRow, "name" | "lastname" | "rating">): string {
  return `${p.name} ${p.lastname} (ELO ${p.rating})`;
}

export default async function AdminTournamentTeamsPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { slug } = await params;
  const { error: uiError, success } = await searchParams;

  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: tournamentData, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (tournamentError || !tournamentData) notFound();
  const tournament = tournamentData as TournamentDbRow;

  const { data: relationRows } = await supabase
    .from("player_tournament")
    .select("player_id")
    .eq("tournament_id", tournament.id);
  const tournamentPlayerIds = new Set(
    (relationRows ?? []).map((r) => Number((r as { player_id: number }).player_id))
  );

  const { data: playersRows } = await supabase
    .from("players")
    .select("id, name, lastname, rating")
    .order("rating", { ascending: false });
  const allPlayers = ((playersRows ?? []) as Array<
    Pick<PlayerDbRow, "id" | "name" | "lastname" | "rating">
  >).filter((p) => tournamentPlayerIds.has(p.id));
  const playersById = new Map(allPlayers.map((p) => [p.id, p]));

  const { data: teamsRows } = await supabase
    .from("teams")
    .select(
      "id, player1_id, player2_id, team_name, status, average_rating, points, wins, losses, matches_played, final_position"
    )
    .eq("tournament_id", tournament.id)
    .order("id", { ascending: true });
  const teams = (teamsRows ?? []) as TeamRow[];

  return (
    <div className="w-full max-w-6xl rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Admin / Teams</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/admin/tournaments/${slug}`} className="text-primary underline-offset-4 hover:underline">
            Volver al torneo
          </Link>
          <Link href="/admin/tournaments" className="text-primary underline-offset-4 hover:underline">
            Volver a torneos
          </Link>
        </div>
      </div>

      <p className="mb-4 text-sm text-[color:var(--color-subtle-text)]">
        {tournament.name} - crear, editar o eliminar equipos.
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

      <section className="mb-6 rounded-lg border border-foreground/10 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Crear equipo
        </h2>
        <form action={createTeamAction} className="grid gap-3 md:grid-cols-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <label className="flex flex-col gap-1 text-sm">
            Player 1
            <select
              name="player1Id"
              required
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            >
              <option value="">Seleccionar...</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {playerLabel(p)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Player 2
            <select
              name="player2Id"
              required
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            >
              <option value="">Seleccionar...</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {playerLabel(p)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Team name
            <input
              name="teamName"
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Status
            <input
              name="status"
              defaultValue="registered"
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Crear equipo
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-foreground/10 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Equipos del torneo
        </h2>
        {teams.length === 0 ? (
          <p className="text-sm text-[color:var(--color-subtle-text)]">Aun no hay equipos.</p>
        ) : (
          <ul className="space-y-3">
            {teams.map((team) => (
              <li key={team.id} className="rounded-lg border border-foreground/10 p-3">
                <div className="grid gap-3 md:grid-cols-5">
                  <form action={updateTeamAction} className="contents">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="teamId" value={team.id} />
                    <label className="flex flex-col gap-1 text-xs">
                      Player 1
                      <select
                        name="player1Id"
                        required
                        defaultValue={team.player1_id}
                        className="rounded-lg border border-foreground/15 bg-background px-2 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
                      >
                        {allPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {playerLabel(p)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                      Player 2
                      <select
                        name="player2Id"
                        required
                        defaultValue={team.player2_id}
                        className="rounded-lg border border-foreground/15 bg-background px-2 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
                      >
                        {allPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {playerLabel(p)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                      Team name
                      <input
                        name="teamName"
                        defaultValue={team.team_name ?? ""}
                        className="rounded-lg border border-foreground/15 bg-background px-2 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs">
                      Status
                      <input
                        name="status"
                        defaultValue={team.status}
                        className="rounded-lg border border-foreground/15 bg-background px-2 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="submit"
                        className="rounded border border-foreground/20 bg-background px-3 py-2 text-xs font-medium transition hover:bg-muted"
                      >
                        Save
                      </button>
                      <span />
                    </div>
                  </form>
                </div>
                <form action={deleteTeamAction} className="mt-2">
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="teamId" value={team.id} />
                  <button
                    type="submit"
                    className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </form>
                <p className="mt-2 text-xs text-[color:var(--color-subtle-text)]">
                  {playersById.get(team.player1_id)
                    ? playerLabel(playersById.get(team.player1_id)!)
                    : `Player #${team.player1_id}`}{" "}
                  +{" "}
                  {playersById.get(team.player2_id)
                    ? playerLabel(playersById.get(team.player2_id)!)
                    : `Player #${team.player2_id}`}{" "}
                  | Avg: {team.average_rating} | Pts: {team.points} | W-L: {team.wins}-{team.losses}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
