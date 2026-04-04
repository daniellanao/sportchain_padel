import Image from "next/image";
import Link from "next/link";

import { type Tournament } from "@/data/tournaments";
import { isRemoteImageSrc } from "@/lib/image-remote";

export type TournamentPastCardProps = {
  tournament: Tournament;
};

/**
 * Tarjeta compacta para torneos finalizados en `/torneos`: imagen, título, fecha y enlace al detalle.
 */
export function TournamentPastCard({ tournament: t }: TournamentPastCardProps) {
  return (
    <li data-slug={t.slug} className="flex h-full min-h-0">
      <Link
        href={`/torneos/${t.slug}`}
        className="group flex h-full min-w-0 flex-1 flex-col overflow-hidden border-2 border-[var(--color-foreground)]/15 bg-[var(--color-surface)] shadow-[3px_3px_0_rgba(0,0,0,0.08)] transition hover:border-[var(--color-primary)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)]"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[var(--color-muted)]">
          {t.imageUrl ? (
            <Image
              src={t.imageUrl}
              alt={t.name}
              fill
              className="object-cover transition group-hover:brightness-95"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={isRemoteImageSrc(t.imageUrl)}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-muted)_0%,var(--color-surface)_100%)]" aria-hidden />
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
          <h3 className="min-w-0 text-sm font-black uppercase leading-tight text-[var(--color-primary)] group-hover:underline sm:text-base">
            {t.name}
          </h3>
          <p className="text-sm font-medium text-[var(--color-subtle-text)]">{t.dateLabel}</p>
          <span className="navbar-text btn-gold mt-auto inline-flex min-h-[40px] w-full items-center justify-center border-2 border-[var(--color-accent-gold)] px-4 py-2 text-center text-xs uppercase">
            Ver detalle
          </span>
        </div>
      </Link>
    </li>
  );
}
