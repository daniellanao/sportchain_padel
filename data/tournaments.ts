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
  /** Public URL — file lives under `public/` (e.g. `/tournaments/aleph_padel_tournament.png`) */
  imageUrl?: string;
  /** Venue / city (e.g. from Supabase `location`) */
  location?: string;
  /** Minimum ELO required to register (optional) */
  minElo?: number;
};

/** Human-readable format line for cards and detail pages */
export function formatTournamentFormatLabel(t: Tournament): string {
  if (t.format === "american") {
    return `American format · ${t.rounds} rounds`;
  }
  return `Swiss system · ${t.rounds} rounds`;
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
