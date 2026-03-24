"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeText(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function createPlayerAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const name = normalizeText(formData.get("name"));
  const lastname = normalizeText(formData.get("lastname"));
  const emailRaw = normalizeText(formData.get("email"));
  const email = emailRaw ? emailRaw.toLowerCase() : null;

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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/players?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/players");
  redirect("/admin/players?success=Jugador+actualizado");
}
