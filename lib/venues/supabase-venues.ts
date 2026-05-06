import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Row shape for `public.venues` */
export type VenueDbRow = {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  stars: number | null;
  address: string | null;
  web: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string | null;
};

export type VenuesListResult =
  | { ok: true; venues: VenueDbRow[] }
  | { ok: false; error: string; venues: VenueDbRow[] };

export async function fetchVenuesListFromSupabase(): Promise<VenuesListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      venues: [],
    };
  }

  const { data, error } = await supabase
    .from("venues")
    .select("id, name, slug, image, stars, address, web, phone, lat, lng, created_at")
    .order("name", { ascending: true });

  if (error) {
    return { ok: false, error: error.message, venues: [] };
  }

  return { ok: true, venues: (data ?? []) as VenueDbRow[] };
}
