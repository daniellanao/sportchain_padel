"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function toOptionalText(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  return text ? text : null;
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

async function buildUniqueSlug(base: string, fallbackFromName: string): Promise<string> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackFromName;

  const safeBase = base || fallbackFromName;
  let candidate = safeBase;

  for (let i = 2; i < 1000; i += 1) {
    const { data, error } = await supabase
      .from("tournaments")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) return candidate;
    if (!data) return candidate;
    candidate = `${safeBase}-${i}`;
  }

  return `${safeBase}-${Date.now()}`;
}

export async function createTournamentAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/admin/tournaments/create?error=El+nombre+es+obligatorio");
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/tournaments/create?error=Configuracion+de+Supabase+incompleta");
  }

  const formatRaw = String(formData.get("format") ?? "swiss").trim().toLowerCase();
  const statusRaw = String(formData.get("status") ?? "draft").trim().toLowerCase();
  const format = formatRaw || "swiss";
  const status = statusRaw || "draft";

  const fallbackFromName = slugify(name) || `tournament-${Date.now()}`;
  const requestedSlug = slugify(String(formData.get("slug") ?? ""));
  const slug = await buildUniqueSlug(requestedSlug, fallbackFromName);

  const startDate = toOptionalIsoDate(formData.get("start_date"));
  const endDate = toOptionalIsoDate(formData.get("end_date"));
  if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    redirect("/admin/tournaments/create?error=La+fecha+de+fin+no+puede+ser+anterior+a+la+de+inicio");
  }

  const payload = {
    name,
    slug,
    format,
    status,
    location: toOptionalText(formData.get("location")),
    start_date: startDate,
    end_date: endDate,
    max_teams: toOptionalPositiveInt(formData.get("max_teams")),
    total_rounds: toOptionalPositiveInt(formData.get("total_rounds")),
    description: toOptionalText(formData.get("description")),
    image: toOptionalText(formData.get("image")),
  };

  const { error } = await supabase.from("tournaments").insert(payload);
  if (error) {
    redirect(`/admin/tournaments/create?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/tournaments");
  revalidatePath("/torneos");
  redirect(`/admin/tournaments/${slug}?success=Torneo+creado`);
}
