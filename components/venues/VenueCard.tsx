import type { VenueDbRow } from "@/lib/venues/supabase-venues";

function formatStars(s: number | null): string | null {
  if (s == null || Number.isNaN(s)) return null;
  return String(Math.round(s * 10) / 10);
}

function normalizeWebHref(web: string): string {
  const t = web.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function webLabel(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./i, "");
  } catch {
    return href;
  }
}

/** Card de club: nombre, estrellas de Google, web y teléfono (`/clubes` y home). */
export function VenueCard({ venue }: { venue: VenueDbRow }) {
  const stars = formatStars(venue.stars);
  const webHref = venue.web?.trim() ? normalizeWebHref(venue.web) : null;
  const phone = venue.phone?.trim() || null;

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-[#12305D]/15 bg-[var(--color-surface)] p-4 shadow-sm">
      <h3 className="truncate text-sm font-bold uppercase leading-tight text-[var(--color-primary)]">{venue.name}</h3>

      <p className="flex items-center gap-1.5 text-xs">
        {stars ? (
          <>
            <span className="font-bold tabular-nums text-[var(--color-foreground)]">{stars}</span>
            <span className="text-[var(--color-accent-gold)]" aria-hidden>
              ★
            </span>
            <span className="text-[var(--color-subtle-text)]">Google</span>
          </>
        ) : (
          <span className="text-[var(--color-subtle-text)]">Sin valoración en Google</span>
        )}
      </p>

      <dl className="mt-auto flex flex-col gap-1 text-xs">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-[var(--color-subtle-text)]">Web</dt>
          <dd className="min-w-0 truncate">
            {webHref ? (
              <a
                href={webHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                {webLabel(webHref)}
              </a>
            ) : (
              <span className="text-[var(--color-subtle-text)]">—</span>
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 text-[var(--color-subtle-text)]">Teléfono</dt>
          <dd className="min-w-0 truncate">
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                {phone}
              </a>
            ) : (
              <span className="text-[var(--color-subtle-text)]">—</span>
            )}
          </dd>
        </div>
      </dl>
    </li>
  );
}
