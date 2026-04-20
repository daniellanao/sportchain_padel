/**
 * Tournament listings (dummy data).
 */

export type TournamentStatus = "upcoming" | "completed" | "cancelled";

export type TournamentFormat = "swiss" | "american";

export type Tournament = {
  id: string;
  /** URL-safe identifier, `lower_snake_case` (e.g. `aleph_padel_tournament_march_26`) */
  slug: string;
  /** Display title */
  name: string;
  /** ISO date YYYY-MM-DD (local calendar day for the event) */
  dateISO: string;
  /** 24h time HH:mm */
  time24h: string;
  /** Human-readable date for UI (avoids SSR timezone drift) */
  dateLabel: string;
  /** Human-readable time for UI */
  timeLabel: string;
  playerCount: number;
  format: TournamentFormat;
  /** Number of rounds (meaning depends on format) */
  rounds: number;
  status: TournamentStatus;
  /** Supabase `status` normalized for admin: `open` | `finished` */
  adminStatus?: "open" | "finished";
  /** Public URL — file lives under `public/` (e.g. `/tournaments/aleph_padel_tournament.png`) */
  imageUrl?: string;
  /** Venue / city (e.g. from Supabase `location`) */
  location?: string;
  /** Minimum ELO required to register (optional) */
  minElo?: number;
  /** Categoría opcional (p. ej. mensaje WhatsApp por defecto) */
  category?: string;
  /**
   * Texto completo para prellenar WhatsApp si enlazas `wa.me` desde la UI.
   * Si no se define, usa {@link getTournamentWhatsappMessage}.
   */
  whatsappMessage?: string;
};

/**
 * Mensaje por defecto para WhatsApp (torneos tipo {@link Tournament}).
 */
export function getTournamentWhatsappMessage(t: Tournament): string {
  const custom = t.whatsappMessage?.trim();
  if (custom) return custom;
  const cat = t.category?.trim() || "—";
  const venue = t.location?.trim() || "—";
  return `Estoy interesado en participar en el torneo "${t.name}". Fecha: ${t.dateLabel}. Hora: ${t.timeLabel}. Categoría: ${cat}. Sede: ${venue}.`;
}

/** Human-readable format line for cards and detail pages */
export function formatTournamentFormatLabel(t: Tournament): string {
  if (t.format === "american") {
    return `American format · ${t.rounds} rounds`;
  }
  return `Formato · ${t.rounds} Rondas`;
}

export const UPCOMING_TOURNAMENTS: Tournament[] = [
  {
    id: "aleph-padel-march-26",
    slug: "aleph_padel_tournament_march_26",
    name: "Aleph Padel Tournament March '26",
    dateISO: "2025-03-25",
    time24h: "18:30",
    dateLabel: "March 25, 2025",
    timeLabel: "18:30 (6:30 PM)",
    playerCount: 32,
    format: "swiss",
    rounds: 4,
    status: "upcoming",
    imageUrl: "/torneos/aleph_padel_tournament.png",
  }
];

export const PAST_TOURNAMENTS: Tournament[] = [];

export function getTournamentBySlug(slug: string): Tournament | undefined {
  return [...UPCOMING_TOURNAMENTS, ...PAST_TOURNAMENTS].find((t) => t.slug === slug);
}

/**
 * Eventos promocionados en `/torneos` (sin ficha en Supabase / detalle interno).
 * CTA típico: WhatsApp u otro canal externo.
 */
export type CommunityTournament = {
  id: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  /** Texto libre, p. ej. «Formato americano» */
  formatLabel: string;
  category: string;
  /** Sede / dirección corta */
  venue: string;
  organizer: string;
  /** E.164 con + para mostrar; el enlace wa.me usa solo dígitos */
  whatsappE164: string;
  imageUrl?: string;
  /**
   * Texto completo para prellenar WhatsApp (`wa.me/?text=`).
   * Si no se define, se usa {@link getCommunityTournamentWhatsappMessage}.
   */
  whatsappMessage?: string;
};

/**
 * Mensaje por defecto para el CTA de WhatsApp (nombre, fecha, hora, categoría, sede).
 */
export function getCommunityTournamentWhatsappMessage(t: CommunityTournament): string {
  const custom = t.whatsappMessage?.trim();
  if (custom) return custom;
  return `Estoy interesado en participar en el *${t.name} ${t.category}* del ${t.dateLabel} - ${t.timeLabel} en ${t.venue}. Enviado desde Sportchain`;
}

export const COMMUNITY_UPCOMING_TOURNAMENTS: CommunityTournament[] = [
  /**
  {
    id: "torneo-mixto-2026-04-18-adictos",
    name: "Torneo Mixto",
    dateLabel: "18 de abril de 2026",
    timeLabel: "14:30",
    formatLabel: "Formato americano",
    category: "Suma 14",
    venue: "Sportium Alcorta",
    organizer: "Adictos al pádel",
    whatsappE164: "+5491139409498",
    imageUrl: "/torneos/aleph_padel_tournament.png",
  },
  {
    id: "torneo-americano-2026-04-18-adictos",
    name: "Torneo Americano",
    dateLabel: "18 de abril de 2026",
    timeLabel: "17:00",
    formatLabel: "Formato americano",
    category: "Caballeros 6.ª",
    venue: "Sportium Alcorta",
    organizer: "Adictos al pádel",
    whatsappE164: "+5491139409498",
    imageUrl: "/torneos/aleph_padel_tournament.png",
  },
  {
    id: "torneo-mixto-2026-04-18-adictos",
    name: "Torneo Mixto",
    dateLabel: "19 de abril de 2026",
    timeLabel: "09:00",
    formatLabel: "Formato americano",
    category: "Suma 15",
    venue: "Sportium Alcorta",
    organizer: "Adictos al pádel",
    whatsappE164: "+5491139409498",
    imageUrl: "/torneos/aleph_padel_tournament.png",
  },  
  {
    id: "torneo-damas-2026-04-18-adictos",
    name: "Torneo Damas",
    dateLabel: "19 de abril de 2026",
    timeLabel: "11:30",
    formatLabel: "Formato americano",
    category: "Damas 6.ª",
    venue: "Sportium Alcorta",
    organizer: "Adictos al pádel",
    whatsappE164: "+5491139409498",
    imageUrl: "/torneos/aleph_padel_tournament.png",
  }, */
];
