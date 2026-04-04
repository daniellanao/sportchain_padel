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

/** First names only, order matches form selection (before id normalization). */
async function defaultTeamNameFromSelection(
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
  firstSelectedId: number,
  secondSelectedId: number
): Promise<string | null> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .in("id", [firstSelectedId, secondSelectedId]);
  if (error || !data?.length) return null;
  const map = new Map<number, string>();
  for (const row of data as { id: number; name: string }[]) {
    map.set(row.id, String(row.name ?? "").trim());
  }
  const n1 = map.get(firstSelectedId) ?? "";
  const n2 = map.get(secondSelectedId) ?? "";
  if (!n1 && !n2) return null;
  if (!n1) return n2;
  if (!n2) return n1;
  return `${n1} & ${n2}`;
}

export async function createTeamAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const tournamentId = toInt(formData.get("tournamentId"));
  const rawP1 = toInt(formData.get("player1Id"));
  const rawP2 = toInt(formData.get("player2Id"));

  if (!slug || !tournamentId || !rawP1 || !rawP2) redirect("/admin/tournaments");
  if (rawP1 === rawP2) {
    redirect(`${baseTournamentPath(slug)}?error=Selecciona+dos+jugadores+distintos`);
  }
  const [player1Id, player2Id] = normalizeTeamPlayerIds(rawP1, rawP2);

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${baseTournamentPath(slug)}?error=Configuracion+de+Supabase+incompleta`);
  }

  const teamName = await defaultTeamNameFromSelection(supabase, rawP1, rawP2);

  const { error } = await supabase.from("teams").insert({
    tournament_id: tournamentId,
    player1_id: player1Id,
    player2_id: player2Id,
    team_name: teamName,
    status: "registered",
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
  const teamNameRaw = String(formData.get("teamName") ?? "").trim();

  if (!slug || !teamId || !rawP1 || !rawP2) redirect("/admin/tournaments");
  if (rawP1 === rawP2) {
    redirect(`${baseTournamentPath(slug)}?error=Selecciona+dos+jugadores+distintos`);
  }
  const [player1Id, player2Id] = normalizeTeamPlayerIds(rawP1, rawP2);

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`${baseTournamentPath(slug)}?error=Configuracion+de+Supabase+incompleta`);
  }

  let teamName: string | null = teamNameRaw || null;
  if (!teamName) {
    teamName = await defaultTeamNameFromSelection(supabase, rawP1, rawP2);
  }

  const { error } = await supabase
    .from("teams")
    .update({
      player1_id: player1Id,
      player2_id: player2Id,
      team_name: teamName,
      status: "registered",
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
