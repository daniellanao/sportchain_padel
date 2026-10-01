/**
 * Site-wide SEO / URL helpers.
 *
 * URL canónica en la nube: https://padel.sportchain.io
 * Opcional: `NEXT_PUBLIC_SITE_URL` (sin barra final) para staging u override local.
 */
export const PRODUCTION_SITE_URL = "https://padel.sportchain.io" as const;

export const SITE_NAME = "Padel - Sportchain: Clubes, Torneos y Ranking";

export const SITE_DESCRIPTION =
  "Comunidad de Padel de Sportchain: Clubes, Torneos y Ranking"

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
export const DEFAULT_OG_IMAGE_PATH = "/sportchain_opengraph.png";

/**
 * Next replaces `openGraph` per segment instead of merging it, so every page that defines
 * `openGraph` must include `images` or it loses the layout's image.
 */
export const DEFAULT_OG_IMAGES = [
  {
    url: DEFAULT_OG_IMAGE_PATH,
    width: 600,
    height: 400,
    alt: "Sportchain Padel - Clubes, Torneos y Ranking de Padel",
  },
];

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
