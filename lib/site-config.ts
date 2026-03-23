/**
 * Site-wide SEO / URL helpers.
 * Set `NEXT_PUBLIC_SITE_URL` in production (no trailing slash), e.g. https://sportchain.example.com
 */
export const SITE_NAME = "Padel Sportchain | Ranking y Torneos";

export const SITE_DESCRIPTION =
  "Plataforma oficial de eventos de padel de Sportchain: consulta torneos de pádel, clasificaciones en tiempo real y ranking ELO. Sigue el sistema suizo, resultados y la tabla de jugadores en un solo lugar.";

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
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
