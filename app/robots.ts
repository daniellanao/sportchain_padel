import type { MetadataRoute } from "next";

import { absoluteUrl, getSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        /** Fichas de jugador bajo `/ranking/:id` — no indexar (lista general `/ranking` sí). */
        "/ranking/",
        /** Panel y rutas de administración. */
        "/admin/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
