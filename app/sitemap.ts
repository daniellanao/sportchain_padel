import type { MetadataRoute } from "next";

import { PAST_TOURNAMENTS, UPCOMING_TOURNAMENTS } from "@/data/tournaments";
import { fetchPlayersListFromSupabase } from "@/lib/ranking/supabase-players";
import { absoluteUrl, getSiteUrl } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      url: `${base}/torneos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const playersResult = await fetchPlayersListFromSupabase();
  const rankingPlayerRoutes: MetadataRoute.Sitemap =
    playersResult.ok && playersResult.players.length > 0
      ? playersResult.players.map((p) => ({
          url: absoluteUrl(`/ranking/${p.id}`),
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.65,
        }))
      : [];

  const tournamentRoutes: MetadataRoute.Sitemap = [
    ...UPCOMING_TOURNAMENTS,
    ...PAST_TOURNAMENTS,
  ].map((t) => ({
    url: absoluteUrl(`/torneos/${t.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...rankingPlayerRoutes, ...tournamentRoutes];
}
