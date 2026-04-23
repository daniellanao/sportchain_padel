"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function toOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function controlPath(slug: string): string {
  return `/admin/tournaments/${slug}/control`;
}

export async function updateMatchControlAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const matchId = toOptionalInt(formData.get("matchId"));
  const team1Id = toOptionalInt(formData.get("team1Id"));
  const team2Id = toOptionalInt(formData.get("team2Id"));
  const team1Games = toInt(formData.get("team1Games"));
  const team2Games = toInt(formData.get("team2Games"));
  const winnerTeamId = toOptionalInt(formData.get("winnerTeamId"));
  const finished = String(formData.get("finished") ?? "") === "on";

  if (!slug || !matchId || team1Games == null || team2Games == null) {
    redirect("/admin/tournaments");
  }
  if (team1Id == null && team2Id == null) {
    redirect(`${controlPath(slug)}?error=Debes+seleccionar+al+menos+un+equipo`);
  }
  if (team1Id != null && team2Id != null && team1Id === team2Id) {
    redirect(`${controlPath(slug)}?error=Equipo+1+y+Equipo+2+no+pueden+ser+iguales`);
  }
  if (team1Games < 0 || team1Games > 6 || team2Games < 0 || team2Games > 6) {
    redirect(`${controlPath(slug)}?error=Games+debe+estar+entre+0+y+6`);
  }

  // If winner no longer matches selected teams, clear it instead of blocking save.
  const normalizedWinnerTeamId =
    winnerTeamId != null && winnerTeamId !== team1Id && winnerTeamId !== team2Id ? null : winnerTeamId;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${controlPath(slug)}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase
    .from("matches")
    .update({
      team1_id: team1Id,
      team2_id: team2Id,
      team1_games: team1Games,
      team2_games: team2Games,
      winner_team_id: normalizedWinnerTeamId,
      finished,
      status: finished ? "finished" : "scheduled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) {
    redirect(`${controlPath(slug)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(controlPath(slug));
  revalidatePath(`/torneos/${slug}`);
  redirect(`${controlPath(slug)}?success=Partido+actualizado`);
}
