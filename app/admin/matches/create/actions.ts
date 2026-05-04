"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { runProcessRatingMatchElo } from "@/lib/rating/run-process-rating-match-elo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CREATE_PATH = "/admin/matches/create";

function toPositiveInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createStandaloneRatingMatchAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const winnerRaw = String(formData.get("winnerSide") ?? "").trim();
  const winnerSide = winnerRaw === "1" || winnerRaw === "2" ? Number(winnerRaw) : null;
  if (winnerSide == null) {
    redirect(`${CREATE_PATH}?error=${encodeURIComponent("Selecciona el equipo ganador.")}`);
  }

  const p11 = toPositiveInt(formData.get("player_s1_r1"));
  const p12 = toPositiveInt(formData.get("player_s1_r2"));
  const p21 = toPositiveInt(formData.get("player_s2_r1"));
  const p22 = toPositiveInt(formData.get("player_s2_r2"));
  if (p11 == null || p12 == null || p21 == null || p22 == null) {
    redirect(`${CREATE_PATH}?error=${encodeURIComponent("Selecciona los cuatro jugadores.")}`);
  }

  const ids = [p11, p12, p21, p22];
  if (new Set(ids).size !== 4) {
    redirect(`${CREATE_PATH}?error=${encodeURIComponent("Los cuatro jugadores deben ser distintos.")}`);
  }

  const playedRaw = String(formData.get("playedAt") ?? "").trim();
  let playedAtIso: string;
  if (!playedRaw) {
    playedAtIso = new Date().toISOString();
  } else {
    const d = new Date(playedRaw);
    if (Number.isNaN(d.getTime())) {
      redirect(`${CREATE_PATH}?error=${encodeURIComponent("Fecha u hora no válida.")}`);
    }
    playedAtIso = d.toISOString();
  }

  const applyElo = formData.get("applyElo") === "1";

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${CREATE_PATH}?error=${encodeURIComponent("Falta configuración de Supabase.")}`);
  }

  const team1Wins = winnerSide === 1;
  const team2Wins = winnerSide === 2;

  const { data: inserted, error: insertErr } = await supabase
    .from("rating_matches")
    .insert({
      tournament_id: null,
      source_match_id: null,
      played_at: playedAtIso,
      status: "valid",
    })
    .select("id")
    .single();

  if (insertErr) {
    redirect(`${CREATE_PATH}?error=${encodeURIComponent(insertErr.message)}`);
  }

  const newId = inserted != null ? Number((inserted as { id: number }).id) : NaN;
  if (!Number.isInteger(newId) || newId <= 0) {
    redirect(`${CREATE_PATH}?error=${encodeURIComponent("No se pudo obtener el id del rating match.")}`);
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
    redirect(`${CREATE_PATH}?error=${encodeURIComponent(playersErr.message)}`);
  }

  revalidatePath("/admin/matches");
  revalidatePath(`/admin/rating-matches/${newId}`);

  const detailPath = `/admin/rating-matches/${newId}`;

  if (applyElo) {
    const elo = await runProcessRatingMatchElo(newId);
    if (!elo.ok) {
      redirect(
        `${detailPath}?error=${encodeURIComponent(`Partido creado; Elo no aplicado: ${elo.error}`)}`,
      );
    }
    revalidatePath("/admin/matches");
    revalidatePath(detailPath);
    redirect(`${detailPath}?success=${encodeURIComponent("Partido creado y Elo aplicado correctamente.")}`);
  }

  redirect(
    `${detailPath}?success=${encodeURIComponent("Partido creado. Puedes aplicar Elo desde esta página si lo necesitas.")}`,
  );
}
