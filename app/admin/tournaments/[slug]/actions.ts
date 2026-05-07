"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function toOptionalText(value: FormDataEntryValue | null): string | null {
  const t = normalizeText(value);
  return t ? t : null;
}

function toOptionalPositiveInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

function toOptionalIsoDate(value: FormDataEntryValue | null): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function buildUniqueTournamentSlugForUpdate(
  base: string,
  fallbackFromName: string,
  excludeId: number,
): Promise<string> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return base || fallbackFromName;

  const safeBase = base || fallbackFromName;
  let candidate = safeBase;

  for (let i = 2; i < 1000; i += 1) {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) return candidate;
    if (!data || Number(data.id) === excludeId) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
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

export async function updateTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const tournamentId = toInt(formData.get("tournamentId"));
  const currentSlug = normalizeText(formData.get("currentSlug"));
  if (!tournamentId || !currentSlug) {
    redirect("/admin/tournaments?error=Datos+de+torneo+invalidos");
  }

  const name = normalizeText(formData.get("name"));
  if (!name) {
    redirect(`/admin/tournaments/${currentSlug}?error=Nombre+obligatorio`);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/tournaments/${currentSlug}?error=Configuracion+de+Supabase+incompleta`);
  }

  const formatRaw = String(formData.get("format") ?? "swiss").trim().toLowerCase();
  const statusRaw = String(formData.get("status") ?? "draft").trim().toLowerCase();
  const format = formatRaw || "swiss";
  const status = statusRaw || "draft";

  const fallbackFromName = slugify(name) || `tournament-${tournamentId}`;
  const requestedSlug = slugify(normalizeText(formData.get("slug")));
  const newSlug = await buildUniqueTournamentSlugForUpdate(
    requestedSlug || fallbackFromName,
    fallbackFromName,
    tournamentId,
  );

  const startDate = toOptionalIsoDate(formData.get("start_date"));
  const endDate = toOptionalIsoDate(formData.get("end_date"));
  if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    redirect(
      `/admin/tournaments/${currentSlug}?error=${encodeURIComponent("La fecha de fin no puede ser anterior a la de inicio")}`,
    );
  }

  const { error } = await supabase
    .from("tournaments")
    .update({
      name,
      slug: newSlug,
      format,
      status,
      location: toOptionalText(formData.get("location")),
      start_date: startDate,
      end_date: endDate,
      max_teams: toOptionalPositiveInt(formData.get("max_teams")),
      total_rounds: toOptionalPositiveInt(formData.get("total_rounds")),
      description: toOptionalText(formData.get("description")),
      image: toOptionalText(formData.get("image")),
      register_url: toOptionalText(formData.get("register_url")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tournamentId);

  if (error) {
    redirect(`/admin/tournaments/${currentSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/tournaments");
  revalidatePath(`/admin/tournaments/${currentSlug}`);
  revalidatePath(`/admin/tournaments/${newSlug}`);
  revalidatePath("/torneos");
  revalidatePath(`/torneos/${currentSlug}`);
  revalidatePath(`/torneos/${newSlug}`);

  redirect(`/admin/tournaments/${newSlug}?success=Torneo+actualizado`);
}
