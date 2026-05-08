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

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeWhatsapp(value: FormDataEntryValue | null): string | null {
  const raw = normalizeText(value);
  if (!raw) return null;
  const digits = raw.replace(/\s+/g, "");
  return digits || null;
}

async function buildUniqueOrganizerSlugForUpdate(
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
      .from("organizers")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) return candidate;
    if (!data || Number(data.id) === excludeId) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

export async function addPlayerToOrganizerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const organizerId = toInt(formData.get("organizerId"));
  const playerId = toInt(formData.get("playerId"));
  const slug = normalizeText(formData.get("slug"));
  if (!organizerId || !playerId || !slug) redirect("/admin/organizers");

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/organizers/${slug}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase.from("organizer_players").insert({
    organizer_id: organizerId,
    player_id: playerId,
  });

  if (error) {
    redirect(`/admin/organizers/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/organizers/${slug}`);
  redirect(`/admin/organizers/${slug}?success=Jugador+anadido`);
}

export async function removePlayerFromOrganizerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const organizerPlayerId = toInt(formData.get("organizerPlayerId"));
  const slug = normalizeText(formData.get("slug"));
  if (!organizerPlayerId || !slug) redirect("/admin/organizers");

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/organizers/${slug}?error=Configuracion+de+Supabase+incompleta`);
  }

  const { error } = await supabase
    .from("organizer_players")
    .delete()
    .eq("id", organizerPlayerId);

  if (error) {
    redirect(`/admin/organizers/${slug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/organizers/${slug}`);
  redirect(`/admin/organizers/${slug}?success=Jugador+eliminado`);
}

export async function updateOrganizerFromDetailAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const organizerId = toInt(formData.get("organizerId"));
  const currentSlug = normalizeText(formData.get("currentSlug"));
  if (!organizerId || !currentSlug) {
    redirect("/admin/organizers?error=Datos+de+organizador+invalidos");
  }

  const name = normalizeText(formData.get("name"));
  if (!name) {
    redirect(`/admin/organizers/${currentSlug}?error=Nombre+obligatorio`);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(`/admin/organizers/${currentSlug}?error=Configuracion+de+Supabase+incompleta`);
  }

  const fallbackFromName = slugify(name) || `organizer-${organizerId}`;
  const requestedSlug = slugify(normalizeText(formData.get("slug")));
  const newSlug = await buildUniqueOrganizerSlugForUpdate(
    requestedSlug || fallbackFromName,
    fallbackFromName,
    organizerId,
  );

  const image = toOptionalText(formData.get("image"));
  const whatsapp = normalizeWhatsapp(formData.get("whatsapp"));

  const { error } = await supabase
    .from("organizers")
    .update({
      name,
      slug: newSlug,
      image,
      whatsapp,
    })
    .eq("id", organizerId);

  if (error) {
    redirect(`/admin/organizers/${currentSlug}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/organizers");
  revalidatePath(`/admin/organizers/${currentSlug}`);
  revalidatePath(`/admin/organizers/${newSlug}`);

  redirect(`/admin/organizers/${newSlug}?success=Organizador+actualizado`);
}
