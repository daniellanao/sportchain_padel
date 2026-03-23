import type { MetadataRoute } from "next";

import { RANKING_PLAYERS } from "@/data/ranking";
import { PAST_TOURNAMENTS, UPCOMING_TOURNAMENTS } from "@/data/tournaments";
import { absoluteUrl, getSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/ranking`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/tournaments`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/pitch`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const rankingPlayerRoutes: MetadataRoute.Sitemap = RANKING_PLAYERS.map((p) => ({
    url: absoluteUrl(`/ranking/${p.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  const tournamentRoutes: MetadataRoute.Sitemap = [
    ...UPCOMING_TOURNAMENTS,
    ...PAST_TOURNAMENTS,
  ].map((t) => ({
    url: absoluteUrl(`/tournaments/${t.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...rankingPlayerRoutes, ...tournamentRoutes];
}
