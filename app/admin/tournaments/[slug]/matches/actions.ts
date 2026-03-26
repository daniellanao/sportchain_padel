"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function matchesPath(slug: string): string {
  return `/admin/tournaments/${slug}/matches`;
}

function toPositiveInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Same logic as `derived_winner_team_id` in `supabase/standings-triggers.sql`. */
function derivedWinnerTeamId(m: {
  winner_team_id: number | null;
  team1_id: number | null;
  team2_id: number | null;
  team1_games: number;
  team2_games: number;
}): number | null {
  if (m.winner_team_id != null) return Number(m.winner_team_id);
  const t1 = m.team1_id != null ? Number(m.team1_id) : null;
  const t2 = m.team2_id != null ? Number(m.team2_id) : null;
  if (t1 != null && t2 != null) {
    if (m.team1_games > m.team2_games) return t1;
    if (m.team2_games > m.team1_games) return t2;
  }
  return null;
}

type MatchForRatingRow = {
  id: number;
  tournament_id: number;
  finished: boolean;
  team1_id: number | null;
  team2_id: number | null;
  winner_team_id: number | null;
  team1_games: number;
  team2_games: number;
};

type TeamPlayersRow = {
  id: number;
  player1_id: number;
  player2_id: number;
};

export async function createRatingMatchAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const tournamentId = toPositiveInt(formData.get("tournamentId"));
  const sourceMatchId = toPositiveInt(formData.get("sourceMatchId"));

  if (!slug || !tournamentId || !sourceMatchId) {
    redirect(
      slug
        ? `${matchesPath(slug)}?error=${encodeURIComponent("Datos inválidos.")}`
        : `/admin/tournaments?error=${encodeURIComponent("Datos inválidos.")}`
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${matchesPath(slug)}?error=${encodeURIComponent("Falta configuración de Supabase.")}`);
  }

  const { data: matchRow, error: matchErr } = await supabase
    .from("matches")
    .select(
      "id, tournament_id, finished, team1_id, team2_id, winner_team_id, team1_games, team2_games"
    )
    .eq("id", sourceMatchId)
    .maybeSingle();

  if (matchErr || !matchRow) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent(matchErr?.message ?? "Partido no encontrado.")}`
    );
  }

  const m = matchRow as MatchForRatingRow;
  if (Number(m.tournament_id) !== tournamentId) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("El partido no pertenece a este torneo.")}`
    );
  }
  if (!m.finished) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("Solo se pueden crear rating matches de partidos finalizados.")}`
    );
  }

  const team1Id = m.team1_id != null ? Number(m.team1_id) : null;
  const team2Id = m.team2_id != null ? Number(m.team2_id) : null;
  if (team1Id == null || team2Id == null) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("El partido debe tener ambos equipos asignados.")}`
    );
  }

  const winnerTeamId = derivedWinnerTeamId({
    winner_team_id: m.winner_team_id,
    team1_id: m.team1_id,
    team2_id: m.team2_id,
    team1_games: Number(m.team1_games) || 0,
    team2_games: Number(m.team2_games) || 0,
  });
  if (winnerTeamId == null) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("No se puede determinar el equipo ganador (empate o datos incompletos).")}`
    );
  }

  const { data: teamsData, error: teamsErr } = await supabase
    .from("teams")
    .select("id, player1_id, player2_id")
    .in("id", [team1Id, team2Id])
    .eq("tournament_id", tournamentId);

  if (teamsErr || !teamsData || teamsData.length !== 2) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent(teamsErr?.message ?? "No se pudieron cargar los equipos del partido.")}`
    );
  }

  const teamById = new Map<number, TeamPlayersRow>(
    (teamsData as TeamPlayersRow[]).map((t) => [Number(t.id), t])
  );
  const t1 = teamById.get(team1Id);
  const t2 = teamById.get(team2Id);
  if (!t1 || !t2) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("Equipos del partido no encontrados en este torneo.")}`
    );
  }

  const p11 = Number(t1.player1_id);
  const p12 = Number(t1.player2_id);
  const p21 = Number(t2.player1_id);
  const p22 = Number(t2.player2_id);
  if (!Number.isInteger(p11) || p11 <= 0 || !Number.isInteger(p12) || p12 <= 0) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("El equipo 1 no tiene dos jugadores válidos.")}`
    );
  }
  if (!Number.isInteger(p21) || p21 <= 0 || !Number.isInteger(p22) || p22 <= 0) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("El equipo 2 no tiene dos jugadores válidos.")}`
    );
  }

  const team1Wins = winnerTeamId === team1Id;
  const team2Wins = winnerTeamId === team2Id;
  if (!team1Wins && !team2Wins) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("El ganador del partido no coincide con los equipos enfrentados.")}`
    );
  }

  const { data: existing } = await supabase
    .from("rating_matches")
    .select("id")
    .eq("source_match_id", sourceMatchId)
    .maybeSingle();

  if (existing) {
    redirect(
      `${matchesPath(slug)}?error=${encodeURIComponent("Ya existe un rating match para este partido.")}`
    );
  }

  const playedAt = new Date().toISOString();
  const { data: inserted, error: insertErr } = await supabase
    .from("rating_matches")
    .insert({
      tournament_id: tournamentId,
      source_match_id: sourceMatchId,
      played_at: playedAt,
      status: "valid",
    })
    .select("id")
    .single();

  if (insertErr) {
    redirect(`${matchesPath(slug)}?error=${encodeURIComponent(insertErr.message)}`);
  }

  const newId = inserted != null ? Number((inserted as { id: number }).id) : NaN;
  if (!Number.isInteger(newId) || newId <= 0) {
    redirect(`${matchesPath(slug)}?error=${encodeURIComponent("No se pudo obtener el id del rating match.")}`);
  }

  const playerRows = [
    {
      rating_match_id: newId,
      player_id: p11,
      side: 1,
      role: 1,
      is_winner: team1Wins,
    },
    {
      rating_match_id: newId,
      player_id: p12,
      side: 1,
      role: 2,
      is_winner: team1Wins,
    },
    {
      rating_match_id: newId,
      player_id: p21,
      side: 2,
      role: 1,
      is_winner: team2Wins,
    },
    {
      rating_match_id: newId,
      player_id: p22,
      side: 2,
      role: 2,
      is_winner: team2Wins,
    },
  ];

  const { error: playersErr } = await supabase.from("rating_match_players").insert(playerRows);

  if (playersErr) {
    await supabase.from("rating_matches").delete().eq("id", newId);
    redirect(`${matchesPath(slug)}?error=${encodeURIComponent(playersErr.message)}`);
  }

  revalidatePath(matchesPath(slug));
  revalidatePath(`/admin/rating-matches/${newId}`);
  redirect(`/admin/rating-matches/${newId}`);
}
