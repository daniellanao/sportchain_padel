import { formatArgentinaStartLabels } from "@/lib/date-argentina";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { OpenTournamentDbRow } from "@/lib/open-tournaments/supabase-open-tournaments";

/** Datos listos para `TournamentCommunityCard` / listado público en `/torneos`. */
export type OpenTournamentPublicItem = {
  id: number;
  name: string;
  slug: string | null;
  dateLabel: string;
  timeLabel: string;
  category: string | null;
  format: string | null;
  organizerName: string;
  organizerSlug: string | null;
  organizerImageUrl?: string;
  organizerWhatsapp: string | null;
  venueName: string | null;
  venueAddress: string | null;
};

export type OpenTournamentsPublicListResult =
  | { ok: true; upcoming: OpenTournamentPublicItem[] }
  | { ok: false; error: string; upcoming: OpenTournamentPublicItem[] };

function normalizeImageUrl(image: string | null | undefined): string | undefined {
  if (!image?.trim()) return undefined;
  const t = image.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return t.startsWith("/") ? t : `/${t}`;
}

/** Pasado = `end_date` existe y ya terminó. */
function isPastOpenTournament(endDate: string | null, now: number): boolean {
  if (!endDate) return false;
  const t = new Date(endDate).getTime();
  return !Number.isNaN(t) && t < now;
}

type OrganizerRow = {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  whatsapp: string | null;
};
type VenueRow = { id: number; name: string; address: string | null };

/**
 * Torneos abiertos (comunidad) aún vigentes: `open_tournaments` + organizador + sede.
 */
export async function fetchUpcomingOpenTournamentsForPublic(): Promise<OpenTournamentsPublicListResult> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.",
      upcoming: [],
    };
  }

  const { data, error } = await supabase
    .from("open_tournaments")
    .select("id, name, organizer_id, slug, venue_id, start_date, end_date, format, category")
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    return { ok: false, error: error.message, upcoming: [] };
  }

  const rows = (data ?? []) as OpenTournamentDbRow[];
  const now = Date.now();
  const upcomingRows = rows.filter((r) => !isPastOpenTournament(r.end_date, now));

  const orgIds = [...new Set(upcomingRows.map((r) => r.organizer_id))];
  const venueIds = [
    ...new Set(upcomingRows.map((r) => r.venue_id).filter((id): id is number => id != null)),
  ];

  const [orgsResult, venuesResult] = await Promise.all([
    orgIds.length > 0
      ? supabase.from("organizers").select("id, name, slug, image, whatsapp").in("id", orgIds)
      : Promise.resolve({ data: [] as OrganizerRow[] }),
    venueIds.length > 0
      ? supabase.from("venues").select("id, name, address").in("id", venueIds)
      : Promise.resolve({ data: [] as VenueRow[] }),
  ]);

  const orgById = new Map<number, OrganizerRow>(
    ((orgsResult.data ?? []) as OrganizerRow[]).map((o) => [o.id, o]),
  );
  const venueById = new Map<number, VenueRow>(
    ((venuesResult.data ?? []) as VenueRow[]).map((v) => [v.id, v]),
  );

  const upcoming: OpenTournamentPublicItem[] = upcomingRows.map((r) => {
    const org = orgById.get(r.organizer_id);
    const venue = r.venue_id != null ? venueById.get(r.venue_id) : undefined;
    const { dateLabel, timeLabel } = formatArgentinaStartLabels(r.start_date);
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      dateLabel,
      timeLabel,
      category: r.category,
      format: r.format,
      organizerName: org?.name ?? `Organizador #${r.organizer_id}`,
      organizerSlug: org?.slug?.trim() || null,
      organizerImageUrl: normalizeImageUrl(org?.image ?? null),
      organizerWhatsapp: org?.whatsapp?.trim() || null,
      venueName: venue?.name ?? null,
      venueAddress: venue?.address?.trim() || null,
    };
  });

  return { ok: true, upcoming };
}

export function buildOpenTournamentWhatsappMessage(t: OpenTournamentPublicItem): string {
  return `Estoy interesado en ${t.name} del ${t.dateLabel} a las ${t.timeLabel}.`;
}
