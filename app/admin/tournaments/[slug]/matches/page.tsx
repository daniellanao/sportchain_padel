import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createRatingMatchAction } from "@/app/admin/tournaments/[slug]/matches/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Partidos del torneo",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type TeamRow = {
  id: number;
  team_name: string | null;
  player1_id: number;
  player2_id: number;
};

type MatchDbRow = {
  id: number;
  round_number: number;
  team1_id: number | null;
  team2_id: number | null;
  team1_games: number;
  team2_games: number;
  status: string;
  finished: boolean;
};

type PlayerRow = { id: number; name: string; lastname: string };

function toTeamName(team: TeamRow, playersById: Map<number, PlayerRow>): string {
  if (team.team_name?.trim()) return team.team_name.trim();
  const p1 = playersById.get(team.player1_id);
  const p2 = playersById.get(team.player2_id);
  const n1 = p1 ? `${p1.name} ${p1.lastname}` : `Player #${team.player1_id}`;
  const n2 = p2 ? `${p2.name} ${p2.lastname}` : `Player #${team.player2_id}`;
  return `${n1} / ${n2}`;
}

function teamLabel(
  teamId: number | null,
  teamNameById: Map<number, string>
): string {
  if (teamId == null) return "—";
  return teamNameById.get(teamId) ?? `Equipo #${teamId}`;
}

export default async function AdminTournamentMatchesPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { slug } = await params;
  const { error: uiError, success } = await searchParams;

  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: tournamentData, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (tournamentError || !tournamentData) notFound();

  const tournamentId = Number((tournamentData as { id: number }).id);
  const tournamentName = String((tournamentData as { name: string }).name);

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, team_name, player1_id, player2_id")
    .eq("tournament_id", tournamentId)
    .order("id", { ascending: true });
  const teams = (teamsData ?? []) as TeamRow[];

  const playerIds = Array.from(
    new Set(teams.flatMap((t) => [t.player1_id, t.player2_id]).filter((id) => Number.isInteger(id) && id > 0))
  );
  let playersById = new Map<number, PlayerRow>();
  if (playerIds.length > 0) {
    const { data: playersData } = await supabase.from("players").select("id, name, lastname").in("id", playerIds);
    const players = (playersData ?? []) as PlayerRow[];
    playersById = new Map(players.map((p) => [p.id, p]));
  }

  const teamNameById = new Map<number, string>(teams.map((t) => [t.id, toTeamName(t, playersById)]));

  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, round_number, team1_id, team2_id, team1_games, team2_games, status, finished")
    .eq("tournament_id", tournamentId)
    .order("round_number", { ascending: true })
    .order("id", { ascending: true });
  const matches = (matchesData ?? []) as MatchDbRow[];

  const matchIds = matches.map((m) => m.id);
  const { data: ratingRows } =
    matchIds.length > 0
      ? await supabase.from("rating_matches").select("source_match_id").in("source_match_id", matchIds)
      : { data: [] as { source_match_id: number | null }[] | null };
  const ratingSourceIds = new Set(
    ((ratingRows ?? []) as { source_match_id: number | null }[])
      .map((r) => r.source_match_id)
      .filter((id): id is number => id != null && Number.isInteger(id))
  );

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Partidos / {tournamentName}</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={`/admin/tournaments/${slug}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Detalle torneo
          </Link>
          <Link
            href={`/admin/tournaments/${slug}/control`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Control
          </Link>
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

      <div className="overflow-hidden rounded-lg border border-foreground/10">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-foreground/10 bg-[var(--color-muted)]">
              <th className="px-3 py-2 font-semibold">Ronda</th>
              <th className="px-3 py-2 font-semibold">Equipo 1</th>
              <th className="px-3 py-2 text-center font-semibold">G1</th>
              <th className="px-3 py-2 text-center font-semibold">G2</th>
              <th className="px-3 py-2 font-semibold">Equipo 2</th>
              <th className="px-3 py-2 font-semibold">Estado</th>
              <th className="px-3 py-2 font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-[color:var(--color-subtle-text)]">
                  No hay partidos para este torneo.
                </td>
              </tr>
            ) : (
              matches.map((m, i) => (
                <tr
                  key={m.id}
                  className={
                    i % 2 === 0
                      ? "border-t border-foreground/10 bg-[var(--color-surface)]"
                      : "border-t border-foreground/10 bg-[var(--color-muted)]/25"
                  }
                >
                  <td className="whitespace-nowrap px-3 py-2 font-mono tabular-nums">{m.round_number}</td>
                  <td className="max-w-[200px] truncate px-3 py-2">{teamLabel(m.team1_id, teamNameById)}</td>
                  <td className="px-3 py-2 text-center font-mono tabular-nums">{m.team1_games}</td>
                  <td className="px-3 py-2 text-center font-mono tabular-nums">{m.team2_games}</td>
                  <td className="max-w-[200px] truncate px-3 py-2">{teamLabel(m.team2_id, teamNameById)}</td>
                  <td className="px-3 py-2 text-xs text-[color:var(--color-subtle-text)]">
                    {m.finished ? "Finalizado" : "Pendiente"}
                    {m.status ? ` · ${m.status}` : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {m.finished ? (
                      ratingSourceIds.has(m.id) ? (
                        <span className="text-xs text-[color:var(--color-subtle-text)]">Created</span>
                      ) : (
                        <form action={createRatingMatchAction} className="inline">
                          <input type="hidden" name="slug" value={slug} />
                          <input type="hidden" name="tournamentId" value={tournamentId} />
                          <input type="hidden" name="sourceMatchId" value={m.id} />
                          <button
                            type="submit"
                            className="rounded border border-foreground/20 bg-background px-2 py-1 text-xs font-medium text-foreground transition hover:bg-[var(--color-muted)]"
                          >
                            Create Rating Match
                          </button>
                        </form>
                      )
                    ) : (
                      <span className="text-xs text-[color:var(--color-subtle-text)]">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Procesar
        </button>
      </div>
    </div>
  );
}
