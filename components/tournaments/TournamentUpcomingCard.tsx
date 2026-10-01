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
      <div className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#12305D]/15 bg-[var(--color-surface)] shadow-sm">
        {/* Fila 1: imagen | texto */}
        <div className="flex flex-row gap-4 p-4 sm:gap-5 sm:p-5">
          <div className="relative aspect-square w-24 shrink-0 self-start overflow-hidden rounded-lg bg-[var(--color-muted)] sm:w-32">
            {t.imageUrl ? (
              <Image
                src={t.imageUrl}
                alt={t.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 128px"
                priority
                unoptimized={isRemoteImageSrc(t.imageUrl)}
              />
            ) : (
              <div className="absolute inset-0 bg-[var(--color-muted)]" aria-hidden />
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-3">
            <Link
              href={`/torneos/${t.slug}`}
              className="line-clamp-2 min-w-0 text-base font-extrabold uppercase leading-tight text-[var(--color-primary)] hover:underline sm:text-lg"
            >
              {t.name}
            </Link>

            {t.description ? (
              <p className="line-clamp-3 text-sm leading-snug text-[var(--color-subtle-text)]">
                {t.description}
              </p>
            ) : null}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="h-3.5 w-3.5 shrink-0 text-[var(--color-subtle-text)]"
                  aria-hidden
                />
                <span className="sr-only">Fecha:</span>
                <span className="font-medium text-[var(--color-foreground)]">{t.dateLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="h-3.5 w-3.5 shrink-0 text-[var(--color-subtle-text)]"
                    aria-hidden
                  />
                  <span className="sr-only">Hora:</span>
                  <span className="font-medium text-[var(--color-foreground)]">{t.timeLabel}</span>
                </div>
                {showRegistrationRatio ? (
                  <span
                    className="shrink-0 rounded-full bg-[var(--color-muted)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[var(--color-primary)]"
                    title="Inscritos / plazas máximas"
                  >
                    {registered}/{maxSlots}
                  </span>
                ) : registered > 0 ? (
                  <span
                    className="shrink-0 rounded-full bg-[var(--color-muted)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[var(--color-primary)]"
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
        <div className="mt-auto flex flex-col gap-2 border-t border-[#12305D]/10 px-4 py-3 sm:flex-row sm:px-5">
          <Link
            href={`/torneos/${t.slug}`}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-black/30 px-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-black transition hover:border-black hover:bg-black/5"
          >
            Ver torneo
          </Link>
          {registerHref ? (
            <Link
              href={registerHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-black px-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#E3C273] transition hover:bg-black/85"
            >
              Inscribirse
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}
