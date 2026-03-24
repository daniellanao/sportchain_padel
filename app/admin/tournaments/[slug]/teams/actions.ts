"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeTeamPlayerIds(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a];
}

function baseTournamentPath(slug: string): string {
  return `/admin/tournaments/${slug}/teams`;
}

export async function createTeamAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const tournamentId = toInt(formData.get("tournamentId"));
  const rawP1 = toInt(formData.get("player1Id"));
  const rawP2 = toInt(formData.get("player2Id"));
  const teamName = String(formData.get("teamName") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "").trim() || "registered";

  if (!slug || !tournamentId || !rawP1 || !rawP2) redirect("/admin/tournaments");
  if (rawP1 === rawP2) {
    redirect(`${baseTournamentPath(slug)}?error=Selecciona+dos+jugadores+distintos`);
  }
  const [player1Id, player2Id] = normalizeTeamPlayerIds(rawP1, rawP2);

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${baseTournamentPath(slug)}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase.from("teams").insert({
    tournament_id: tournamentId,
    player1_id: player1Id,
    player2_id: player2Id,
    team_name: teamName,
    status,
  });

  if (error) {
    redirect(`${baseTournamentPath(slug)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(baseTournamentPath(slug));
  redirect(`${baseTournamentPath(slug)}?success=Equipo+creado`);
}

export async function updateTeamAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const teamId = toInt(formData.get("teamId"));
  const rawP1 = toInt(formData.get("player1Id"));
  const rawP2 = toInt(formData.get("player2Id"));
  const teamName = String(formData.get("teamName") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "").trim() || "registered";

  if (!slug || !teamId || !rawP1 || !rawP2) redirect("/admin/tournaments");
  if (rawP1 === rawP2) {
    redirect(`${baseTournamentPath(slug)}?error=Selecciona+dos+jugadores+distintos`);
  }
  const [player1Id, player2Id] = normalizeTeamPlayerIds(rawP1, rawP2);

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${baseTournamentPath(slug)}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase
    .from("teams")
    .update({
      player1_id: player1Id,
      player2_id: player2Id,
      team_name: teamName,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", teamId);

  if (error) {
    redirect(`${baseTournamentPath(slug)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(baseTournamentPath(slug));
  redirect(`${baseTournamentPath(slug)}?success=Equipo+actualizado`);
}

export async function deleteTeamAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const teamId = toInt(formData.get("teamId"));
  if (!slug || !teamId) redirect("/admin/tournaments");

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${baseTournamentPath(slug)}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) {
    redirect(`${baseTournamentPath(slug)}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(baseTournamentPath(slug));
  redirect(`${baseTournamentPath(slug)}?success=Equipo+eliminado`);
}
