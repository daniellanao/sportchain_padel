import { faCalendarDays, faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

import { type Tournament } from "@/data/tournaments";
import { isRemoteImageSrc } from "@/lib/image-remote";

export type TournamentUpcomingCardProps = {
  tournament: Tournament;
};

/**
 * Tarjeta en `/torneos`: fila 1 — imagen cuadrada a la izquierda, título + fecha + hora a la derecha;
 * fila 2 — botones Ver torneo e Inscribirse (`registerUrl`).
 */
export function TournamentUpcomingCard({ tournament: t }: TournamentUpcomingCardProps) {
  const registerHref = t.registerUrl?.trim();
  const registered = t.registeredPlayerCount ?? 0;
  const maxSlots = t.playerCount;
  const showRegistrationRatio = maxSlots > 0;

  return (
    <li data-slug={t.slug} className="flex h-full min-h-0">
      <div className="flex min-h-0 w-full min-w-0 flex-col border-4 border-[var(--color-primary)] bg-[var(--color-muted)]/50 shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
        {/* Fila 1: imagen | texto */}
        <div className="flex flex-row gap-2.5 p-2.5 sm:gap-3 sm:p-3">
          <div className="relative aspect-square w-[4.25rem] shrink-0 self-start overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-surface)] sm:w-24 md:w-28">
            {t.imageUrl ? (
              <Image
                src={t.imageUrl}
                alt={t.name}
                fill
                className="object-cover"
                sizes="80px, 112px"
                priority
                unoptimized={isRemoteImageSrc(t.imageUrl)}
              />
            ) : (
              <div
                className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-muted)_0%,var(--color-surface)_100%)]"
                aria-hidden
              />
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-2">
            <Link
              href={`/torneos/${t.slug}`}
              className="line-clamp-2 min-w-0 text-xs font-black uppercase leading-tight text-[var(--color-primary)] hover:underline sm:text-sm"
            >
              {t.name}
            </Link>

            <div className="space-y-1.5 text-[10px] sm:text-xs">
              <div className="flex gap-1.5">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-primary)]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <span className="navbar-text block text-[9px] uppercase text-[var(--color-subtle-text)]">Fecha</span>
                  <span className="font-medium leading-snug text-[var(--color-foreground)]">{t.dateLabel}</span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="flex min-w-0 gap-1.5">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mt-0.5 h-3 w-3 shrink-0 self-start text-[var(--color-primary)]"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <span className="navbar-text block text-[9px] uppercase text-[var(--color-subtle-text)]">Hora</span>
                    <span className="font-medium leading-snug text-[var(--color-foreground)]">{t.timeLabel}</span>
                  </div>
                </div>
                {showRegistrationRatio ? (
                  <span
                    className="navbar-text shrink-0 text-[9px] font-bold tabular-nums text-[var(--color-primary)] sm:text-[10px]"
                    title="Inscritos / plazas máximas"
                  >
                    {registered}/{maxSlots}
                  </span>
                ) : registered > 0 ? (
                  <span
                    className="navbar-text shrink-0 text-[9px] font-bold tabular-nums text-[var(--color-primary)] sm:text-[10px]"
                    title="Jugadores inscritos"
                  >
                    {registered}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: botones */}
        <div className="flex flex-col gap-2 border-t-2 border-[var(--color-primary)]/20 px-2.5 pb-2.5 pt-2 sm:flex-row sm:px-3 sm:pb-3 sm:pt-2.5">
          <Link
            href={`/torneos/${t.slug}`}
            className="navbar-text btn-gold inline-flex min-h-[36px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-2 py-1.5 text-center text-[9px] uppercase sm:min-h-[40px] sm:text-[10px]"
          >
            Ver torneo
          </Link>
          {registerHref ? (
            <Link
              href={registerHref}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-text btn-gold inline-flex min-h-[36px] flex-1 items-center justify-center border-2 border-[var(--color-accent-gold)] px-2 py-1.5 text-center text-[9px] uppercase sm:min-h-[40px] sm:text-[10px]"
            >
              Inscribirse
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
