"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function addPlayerToTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const tournamentId = toInt(formData.get("tournamentId"));
  const playerId = toInt(formData.get("playerId"));
  const slug = String(formData.get("slug") ?? "").trim();
  if (!tournamentId || !playerId || !slug) redirect("/admin/tournaments");

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/tournaments/${slug}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase.from("player_tournament").insert({
    tournament_id: tournamentId,
    player_id: playerId,
  });

  if (error) {
    redirect(`/admin/tournaments/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/tournaments/${slug}`);
  redirect(`/admin/tournaments/${slug}?success=Jugador+anadido`);
}

export async function removePlayerFromTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const playerTournamentId = toInt(formData.get("playerTournamentId"));
  const slug = String(formData.get("slug") ?? "").trim();
  if (!playerTournamentId || !slug) redirect("/admin/tournaments");

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/tournaments/${slug}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase.from("player_tournament").delete().eq("id", playerTournamentId);
  if (error) {
    redirect(`/admin/tournaments/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/tournaments/${slug}`);
  redirect(`/admin/tournaments/${slug}?success=Jugador+eliminado`);
}
