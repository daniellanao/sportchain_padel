import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Row shape for `public.organizers` */
export type OrganizerDbRow = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  whatsapp: string | null;
  created_at: string | null;
};

export type OrganizersListResult =
  | { ok: true; organizers: OrganizerDbRow[] }
  | { ok: false; error: string; organizers: OrganizerDbRow[] };

export async function fetchOrganizersListFromSupabase(): Promise<OrganizersListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      organizers: [],
    };
  }

  const { data, error } = await supabase
    .from("organizers")
    .select("id, name, slug, image, whatsapp, created_at")
    .order("name", { ascending: true });

  if (error) {
    return { ok: false, error: error.message, organizers: [] };
  }

  return { ok: true, organizers: (data ?? []) as OrganizerDbRow[] };
}
