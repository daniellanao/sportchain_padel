/**
 * Site-wide SEO / URL helpers.
 *
 * URL canónica en la nube: https://padel.sportchain.io
 * Opcional: `NEXT_PUBLIC_SITE_URL` (sin barra final) para staging u override local.
 */
export const PRODUCTION_SITE_URL = "https://padel.sportchain.io" as const;

export const SITE_NAME = "Padel - Sportchain - Ranking y Torneos";

export const SITE_DESCRIPTION =
  "Comunidad de Padel de Sportchain: Ranking de Jugadores y Torneos"

export const SITE_KEYWORDS = [
  "Sportchain",
  "torneos pádel",
  "ranking pádel",
  "ELO pádel",
  "eventos Sportchain",
  "clasificación pádel",
  "padel",
  "sistema suizo",
  "leaderboard pádel",
] as const;

/** Default OG / social image under `public/` */
export const DEFAULT_OG_IMAGE_PATH = "/sportchain_padel_ranking_bg.png";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
