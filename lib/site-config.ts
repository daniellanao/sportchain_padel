/**
 * Site-wide SEO / URL helpers.
 * Set `NEXT_PUBLIC_SITE_URL` in production (no trailing slash), e.g. https://sportchain.example.com
 */
export const SITE_NAME = "Sportchain Padel Ranking";

export const SITE_DESCRIPTION =
  "Padel player rankings powered by ELO. Track matches, climb the leaderboard, and follow Swiss-format tournaments — built for clubs and competitive players.";

export const SITE_KEYWORDS = [
  "padel",
  "padel ranking",
  "ELO rating",
  "padel tournament",
  "Swiss format",
  "Sportchain",
  "leaderboard",
] as const;

/** Default OG / social image under `public/` */
export const DEFAULT_OG_IMAGE_PATH = "/sportchain_padel_ranking_bg.png";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
