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

async function buildUniqueOrganizerSlug(base: string, fallbackFromName: string): Promise<string> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackFromName;

  const safeBase = base || fallbackFromName;
  let candidate = safeBase;

  for (let i = 2; i < 1000; i += 1) {
    const { data, error } = await supabase
      .from("organizers")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) return candidate;
    if (!data) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
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
    if (!data || data.id === excludeId) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

export async function createOrganizerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const name = normalizeText(formData.get("name"));
  if (!name) {
    redirect("/admin/organizers?error=Nombre+obligatorio");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/organizers?error=Configuracion+de+Supabase+incompleta");
  }

  const fallbackFromName = slugify(name) || `organizer-${Date.now()}`;
  const requestedSlug = slugify(normalizeText(formData.get("slug")));
  const slug = await buildUniqueOrganizerSlug(requestedSlug, fallbackFromName);

  const image = toOptionalText(formData.get("image"));
  const whatsapp = normalizeWhatsapp(formData.get("whatsapp"));

  const { error } = await supabase.from("organizers").insert({
    name,
    slug,
    image,
    whatsapp,
  });

  if (error) {
    redirect(`/admin/organizers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/organizers");
  redirect("/admin/organizers?success=Organizador+creado");
}

export async function updateOrganizerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  const name = normalizeText(formData.get("name"));

  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/organizers?error=ID+invalido");
  }
  if (!name) {
    redirect("/admin/organizers?error=Nombre+obligatorio");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/organizers?error=Configuracion+de+Supabase+incompleta");
  }

  const fallbackFromName = slugify(name) || `organizer-${Date.now()}`;
  const requestedSlug = slugify(normalizeText(formData.get("slug")));
  const slug = await buildUniqueOrganizerSlugForUpdate(requestedSlug, fallbackFromName, id);

  const image = toOptionalText(formData.get("image"));
  const whatsapp = normalizeWhatsapp(formData.get("whatsapp"));

  const { error } = await supabase
    .from("organizers")
    .update({
      name,
      slug,
      image,
      whatsapp,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/organizers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/organizers");
  redirect("/admin/organizers?success=Organizador+actualizado");
}

export async function deleteOrganizerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/organizers?error=ID+invalido");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/organizers?error=Configuracion+de+Supabase+incompleta");
  }

  const { error } = await supabase.from("organizers").delete().eq("id", id);

  if (error) {
    redirect(`/admin/organizers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/organizers");
  redirect("/admin/organizers?success=Organizador+eliminado");
}
