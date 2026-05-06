"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function toOptionalText(value: FormDataEntryValue | null): string | null {
  const t = normalizeText(value);
  return t ? t : null;
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

async function buildUniqueOpenTournamentSlug(base: string, fallbackFromName: string): Promise<string> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return base || fallbackFromName;

  const safeBase = base || fallbackFromName;
  let candidate = safeBase;

  for (let i = 2; i < 1000; i += 1) {
    const { data, error } = await supabase
      .from("open_tournaments")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) return candidate;
    if (!data) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

async function buildUniqueOpenTournamentSlugForUpdate(
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
      .from("open_tournaments")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) return candidate;
    if (!data || Number(data.id) === excludeId) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

function parseOrganizerId(value: FormDataEntryValue | null): number | "invalid" {
  const raw = normalizeText(value);
  if (!raw) return "invalid";
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : "invalid";
}

/** Vacío → null; si viene valor debe ser entero > 0. */
function parseOptionalVenueId(value: FormDataEntryValue | null): number | null | "invalid" {
  const raw = normalizeText(value);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : "invalid";
}

export async function createOpenTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const name = normalizeText(formData.get("name"));
  if (!name) {
    redirect("/admin/open-tournaments?error=Nombre+obligatorio");
  }

  const organizerId = parseOrganizerId(formData.get("organizer_id"));
  if (organizerId === "invalid") {
    redirect("/admin/open-tournaments?error=Organizador+obligatorio");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/open-tournaments?error=Configuracion+de+Supabase+incompleta");
  }

  const fallbackFromName = slugify(name) || `open-${Date.now()}`;
  const requestedSlug = slugify(normalizeText(formData.get("slug")));
  const slug = await buildUniqueOpenTournamentSlug(requestedSlug, fallbackFromName);

  const startDate = toOptionalIsoDate(formData.get("start_date"));
  const endDate = toOptionalIsoDate(formData.get("end_date"));
  if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    redirect("/admin/open-tournaments?error=La+fecha+de+fin+no+puede+ser+anterior+a+la+de+inicio");
  }

  const format = toOptionalText(formData.get("format")) ?? "americano";

  const venueId = parseOptionalVenueId(formData.get("venue_id"));
  if (venueId === "invalid") {
    redirect("/admin/open-tournaments?error=Sede+invalida");
  }

  const { error } = await supabase.from("open_tournaments").insert({
    name,
    organizer_id: organizerId,
    slug,
    venue_id: venueId,
    start_date: startDate,
    end_date: endDate,
    format,
    category: toOptionalText(formData.get("category")),
  });

  if (error) {
    redirect(`/admin/open-tournaments?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/open-tournaments");
  redirect("/admin/open-tournaments?success=Torneo+abierto+creado");
}

export async function updateOpenTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  const name = normalizeText(formData.get("name"));

  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/open-tournaments?error=ID+invalido");
  }
  if (!name) {
    redirect("/admin/open-tournaments?error=Nombre+obligatorio");
  }

  const organizerId = parseOrganizerId(formData.get("organizer_id"));
  if (organizerId === "invalid") {
    redirect("/admin/open-tournaments?error=Organizador+obligatorio");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/open-tournaments?error=Configuracion+de+Supabase+incompleta");
  }

  const startDate = toOptionalIsoDate(formData.get("start_date"));
  const endDate = toOptionalIsoDate(formData.get("end_date"));
  if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    redirect("/admin/open-tournaments?error=La+fecha+de+fin+no+puede+ser+anterior+a+la+de+inicio");
  }

  const slugInput = normalizeText(formData.get("slug"));
  let slug: string | null = null;
  if (slugInput) {
    const fallbackFromName = slugify(name) || `open-${Date.now()}`;
    const requestedSlug = slugify(slugInput);
    slug = await buildUniqueOpenTournamentSlugForUpdate(requestedSlug, fallbackFromName, id);
  }

  const format = toOptionalText(formData.get("format"));

  const venueId = parseOptionalVenueId(formData.get("venue_id"));
  if (venueId === "invalid") {
    redirect("/admin/open-tournaments?error=Sede+invalida");
  }

  const { error } = await supabase
    .from("open_tournaments")
    .update({
      name,
      organizer_id: organizerId,
      slug,
      venue_id: venueId,
      start_date: startDate,
      end_date: endDate,
      format,
      category: toOptionalText(formData.get("category")),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/open-tournaments?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/open-tournaments");
  redirect("/admin/open-tournaments?success=Torneo+abierto+actualizado");
}

export async function deleteOpenTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/open-tournaments?error=ID+invalido");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/open-tournaments?error=Configuracion+de+Supabase+incompleta");
  }

  const { error } = await supabase.from("open_tournaments").delete().eq("id", id);

  if (error) {
    redirect(`/admin/open-tournaments?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/open-tournaments");
  redirect("/admin/open-tournaments?success=Torneo+abierto+eliminado");
}
