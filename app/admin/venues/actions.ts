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

/** Empty → null; otherwise 0–5 with at most one decimal (matches numeric(2,1) style). */
function parseOptionalStars(value: FormDataEntryValue | null): number | null | "invalid" {
  const raw = normalizeText(value);
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return "invalid";
  const rounded = Math.round(n * 10) / 10;
  if (rounded < 0 || rounded > 9.9) return "invalid";
  return rounded;
}

function parseOptionalDouble(value: FormDataEntryValue | null): number | null | "invalid" {
  const raw = normalizeText(value);
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return "invalid";
  return n;
}

async function buildUniqueVenueSlug(base: string, fallbackFromName: string): Promise<string> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return base || fallbackFromName;

  const safeBase = base || fallbackFromName;
  let candidate = safeBase;

  for (let i = 2; i < 1000; i += 1) {
    const { data, error } = await supabase.from("venues").select("id").eq("slug", candidate).maybeSingle();

    if (error) return candidate;
    if (!data) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

async function buildUniqueVenueSlugForUpdate(
  base: string,
  fallbackFromName: string,
  excludeId: number,
): Promise<string> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return base || fallbackFromName;

  const safeBase = base || fallbackFromName;
  let candidate = safeBase;

  for (let i = 2; i < 1000; i += 1) {
    const { data, error } = await supabase.from("venues").select("id").eq("slug", candidate).maybeSingle();

    if (error) return candidate;
    if (!data || Number(data.id) === excludeId) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

export async function createVenueAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const name = normalizeText(formData.get("name"));
  if (!name) {
    redirect("/admin/venues?error=Nombre+obligatorio");
  }

  const starsParsed = parseOptionalStars(formData.get("stars"));
  if (starsParsed === "invalid") {
    redirect("/admin/venues?error=Valor+de+estrellas+invalido+%280+a+9%2C9%2C+un+decimal%29");
  }

  const latParsed = parseOptionalDouble(formData.get("lat"));
  const lngParsed = parseOptionalDouble(formData.get("lng"));
  if (latParsed === "invalid" || lngParsed === "invalid") {
    redirect("/admin/venues?error=Latitud+u+longitud+invalidas");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/venues?error=Configuracion+de+Supabase+incompleta");
  }

  const fallbackFromName = slugify(name) || `venue-${Date.now()}`;
  const requestedSlug = slugify(normalizeText(formData.get("slug")));
  const slug = await buildUniqueVenueSlug(requestedSlug, fallbackFromName);

  const { error } = await supabase.from("venues").insert({
    name,
    slug,
    image: toOptionalText(formData.get("image")),
    stars: starsParsed,
    address: toOptionalText(formData.get("address")),
    web: toOptionalText(formData.get("web")),
    phone: toOptionalText(formData.get("phone")),
    lat: latParsed,
    lng: lngParsed,
  });

  if (error) {
    redirect(`/admin/venues?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/venues");
  redirect("/admin/venues?success=Sede+creada");
}

export async function updateVenueAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  const name = normalizeText(formData.get("name"));

  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/venues?error=ID+invalido");
  }
  if (!name) {
    redirect("/admin/venues?error=Nombre+obligatorio");
  }

  const starsParsed = parseOptionalStars(formData.get("stars"));
  if (starsParsed === "invalid") {
    redirect("/admin/venues?error=Valor+de+estrellas+invalido+%280+a+9%2C9%2C+un+decimal%29");
  }

  const latParsed = parseOptionalDouble(formData.get("lat"));
  const lngParsed = parseOptionalDouble(formData.get("lng"));
  if (latParsed === "invalid" || lngParsed === "invalid") {
    redirect("/admin/venues?error=Latitud+u+longitud+invalidas");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/venues?error=Configuracion+de+Supabase+incompleta");
  }

  const slugInput = normalizeText(formData.get("slug"));
  let slug: string | null = null;
  if (slugInput) {
    const fallbackFromName = slugify(name) || `venue-${Date.now()}`;
    const requestedSlug = slugify(slugInput);
    slug = await buildUniqueVenueSlugForUpdate(requestedSlug, fallbackFromName, id);
  }

  const { error } = await supabase
    .from("venues")
    .update({
      name,
      slug,
      image: toOptionalText(formData.get("image")),
      stars: starsParsed,
      address: toOptionalText(formData.get("address")),
      web: toOptionalText(formData.get("web")),
      phone: toOptionalText(formData.get("phone")),
      lat: latParsed,
      lng: lngParsed,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/venues?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/venues");
  redirect("/admin/venues?success=Sede+actualizada");
}

export async function deleteVenueAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/venues?error=ID+invalido");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/venues?error=Configuracion+de+Supabase+incompleta");
  }

  const { error } = await supabase.from("venues").delete().eq("id", id);

  if (error) {
    redirect(`/admin/venues?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/venues");
  redirect("/admin/venues?success=Sede+eliminada");
}
