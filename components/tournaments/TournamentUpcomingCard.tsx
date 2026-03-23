import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

import { formatTournamentFormatLabel, type Tournament } from "@/data/tournaments";
import { isRemoteImageSrc } from "@/lib/image-remote";

export type TournamentUpcomingCardProps = {
  tournament: Tournament;
};

/**
 * Tarjeta enlazada para la cuadrícula de torneos próximos en `/torneos`.
 */
export function TournamentUpcomingCard({ tournament: t }: TournamentUpcomingCardProps) {
  return (
    <li
      data-slug={t.slug}
      className="flex flex-col border-4 border-[var(--color-primary)] bg-[var(--color-muted)]/50 p-4 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-5"
    >
      <Link
        href={`/torneos/${t.slug}`}
        className="group flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)]"
      >
        {t.imageUrl ? (
          <div className="relative mb-3 aspect-[16/10] w-full shrink-0 overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-surface)]">
            <Image
              src={t.imageUrl}
              alt={t.name}
              fill
              className="object-cover transition group-hover:brightness-95"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
              unoptimized={isRemoteImageSrc(t.imageUrl)}
            />
          </div>
        ) : null}
        <div className="mb-2">
          <h5 className="block text-sm font-bold uppercase text-[var(--color-primary)] mb-1">Próximamente</h5>
          <h3 className="block min-w-0 flex-1 text-base font-black uppercase leading-tight text-[var(--color-primary)] group-hover:underline sm:text-lg">
            {t.name}
          </h3>

        {t.location ? (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-[var(--color-subtle-text)]">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mt-0.5 h-[1em] w-[1em] shrink-0 text-[var(--color-primary)]"
              aria-hidden
            />
            <span className="min-w-0">{t.location}</span>
          </p>
        ) : null}
        </div>
        
        {t.minElo != null ? (
          <div
            className="mb-3 border-4 border-[var(--color-accent-gold)] bg-[var(--color-primary)] px-3 py-4 text-center shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
            role="status"
            aria-label={`ELO mínimo requerido: ${t.minElo}`}
          >
            <p className="navbar-text text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent-gold)]">
              ELO mínimo
            </p>
            <p className="navbar-text mt-1 text-4xl font-black leading-none tabular-nums text-white sm:text-5xl">
              {t.minElo}
            </p>
            <p className="mt-2 text-xs font-medium text-[rgba(232,236,245,0.9)]">
              Necesitas al menos esta puntuación para apuntarte
            </p>
          </div>
        ) : null}
        
        <dl className="grid flex-1 grid-cols-1 gap-2 text-sm">
          <div>
            <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">Fecha</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-foreground)]">{t.dateLabel}</dd>
          </div>
          <div>
            <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">Hora de inicio</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-foreground)]">{t.timeLabel}</dd>
          </div>
          <div>
            <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
              Jugadores (máx.)
            </dt>
            <dd className="mt-0.5 font-medium tabular-nums text-[var(--color-foreground)]">{t.playerCount}</dd>
          </div>
          <div>
            <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">Formato</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-foreground)]">
              {formatTournamentFormatLabel(t)}
            </dd>
          </div>
        </dl>
        <span className="navbar-text btn-gold mt-4 inline-flex min-h-[40px] w-full items-center justify-center border-2 border-[var(--color-accent-gold)] px-4 py-2 text-center text-xs uppercase">
          Ver torneo
        </span>
      </Link>
    </li>
  );
}
