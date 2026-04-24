"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

/** Empty → null; otherwise digits only, integer ≥ 0. */
function parseOptionalStars(value: FormDataEntryValue | null): number | null | "invalid" {
  const raw = normalizeText(value);
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return "invalid";
  return Number(raw);
}

function normalizeSocialHandle(
  value: FormDataEntryValue | null,
  network: "linkedin" | "instagram" | "x_twitter",
): string | null {
  const raw = normalizeText(value);
  if (!raw) return null;

  let cleaned = raw
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^@+/, "")
    .split(/[?#]/)[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (network === "linkedin") {
    cleaned = cleaned.replace(/^linkedin\.com\//i, "").replace(/^in\//i, "");
  } else if (network === "instagram") {
    cleaned = cleaned.replace(/^instagram\.com\//i, "");
  } else {
    cleaned = cleaned.replace(/^(x|twitter)\.com\//i, "");
  }

  const firstSegment = cleaned.split("/")[0]?.trim() ?? "";
  return firstSegment || null;
}

export async function createPlayerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const name = normalizeText(formData.get("name"));
  const lastname = normalizeText(formData.get("lastname"));
  const emailRaw = normalizeText(formData.get("email"));
  const email = emailRaw ? emailRaw.toLowerCase() : null;
  const linkedin = normalizeSocialHandle(formData.get("linkedin"), "linkedin");
  const instagram = normalizeSocialHandle(formData.get("instagram"), "instagram");
  const x_twitter = normalizeSocialHandle(formData.get("x_twitter"), "x_twitter");
  const starsParsed = parseOptionalStars(formData.get("stars"));
  if (starsParsed === "invalid") {
    redirect("/admin/players?error=Estrellas+debe+ser+un+entero+mayor+o+igual+a+0");
  }

  if (!name || !lastname) {
    redirect("/admin/players?error=Nombre+y+apellido+son+obligatorios");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/players?error=Configuracion+de+Supabase+incompleta");
  }

  const { error } = await supabase.from("players").insert({
    name,
    lastname,
    email,
    stars: starsParsed,
    linkedin,
    instagram,
    x_twitter,
  });

  if (error) {
    redirect(`/admin/players?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players?success=Jugador+creado");
}

export async function updatePlayerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const idRaw = normalizeText(formData.get("id"));
  const id = Number(idRaw);
  const name = normalizeText(formData.get("name"));
  const lastname = normalizeText(formData.get("lastname"));
  const emailRaw = normalizeText(formData.get("email"));
  const email = emailRaw ? emailRaw.toLowerCase() : null;
  const linkedin = normalizeSocialHandle(formData.get("linkedin"), "linkedin");
  const instagram = normalizeSocialHandle(formData.get("instagram"), "instagram");
  const x_twitter = normalizeSocialHandle(formData.get("x_twitter"), "x_twitter");
  const starsParsed = parseOptionalStars(formData.get("stars"));
  if (starsParsed === "invalid") {
    redirect("/admin/players?error=Estrellas+debe+ser+un+entero+mayor+o+igual+a+0");
  }

  if (!Number.isInteger(id) || id < 1) {
    redirect("/admin/players?error=ID+de+jugador+invalido");
  }
  if (!name || !lastname) {
    redirect("/admin/players?error=Nombre+y+apellido+son+obligatorios");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/players?error=Configuracion+de+Supabase+incompleta");
  }

  const { error } = await supabase
    .from("players")
    .update({
      name,
      lastname,
      email,
      stars: starsParsed,
      linkedin,
      instagram,
      x_twitter,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/players?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players?success=Jugador+actualizado");
}
