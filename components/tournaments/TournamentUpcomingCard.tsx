import {
  faCalendarDays,
  faClock,
  faLayerGroup,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

import { formatTournamentFormatLabel, type Tournament } from "@/data/tournaments";
import { isRemoteImageSrc } from "@/lib/image-remote";

export type TournamentUpcomingCardProps = {
  tournament: Tournament;
};

/**
 * Tarjeta para la cuadrícula de torneos próximos en `/torneos`.
 */
export function TournamentUpcomingCard({ tournament: t }: TournamentUpcomingCardProps) {
  return (
    <li
      data-slug={t.slug}
      className="flex flex-col border-4 border-[var(--color-primary)] bg-[var(--color-muted)]/50 p-4 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-5"
    >
      <div className="group flex min-h-0 flex-1 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
        {t.imageUrl ? (
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-surface)] sm:aspect-[3/4] sm:w-44 md:w-52">
            <Image
              src={t.imageUrl}
              alt={t.name}
              fill
              className="object-cover transition group-hover:brightness-95"
              sizes="(max-width: 640px) 100vw, 208px"
              priority
              unoptimized={isRemoteImageSrc(t.imageUrl)}
            />
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2">
            <h5 className="mb-1 block text-sm font-bold uppercase text-[var(--color-primary)]">
              Próximamente
            </h5>
            <Link
              href={`/torneos/${t.slug}`}
              className="block min-w-0 flex-1 text-base font-black uppercase leading-tight text-[var(--color-primary)] hover:underline sm:text-lg"
            >
              {t.name}
            </Link>
           
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

          <table className="w-full flex-1 border-collapse text-sm">
            <tbody>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th
                  scope="row"
                  className="w-0 py-2 pr-2 align-middle text-left font-normal"
                >
                  <span className="inline-flex items-center gap-2 text-[var(--color-subtle-text)]">
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Fecha</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.dateLabel}</td>
              </tr>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className="inline-flex items-center gap-2 text-[var(--color-subtle-text)]">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Hora de inicio</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.timeLabel}</td>
              </tr>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className="inline-flex items-center gap-2 text-[var(--color-subtle-text)]">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Jugadores (máx.)</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium tabular-nums text-[var(--color-foreground)]">
                  {t.playerCount}
                </td>
              </tr>
              <tr>
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className="inline-flex items-center gap-2 text-[var(--color-subtle-text)]">
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Formato</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">
                  {formatTournamentFormatLabel(t)}
                </td>
              </tr>
            </tbody>
          </table>
          <Link
            href={`/torneos/${t.slug}`}
            className="navbar-text btn-gold mt-4 inline-flex min-h-[40px] w-full items-center justify-center border-2 border-[var(--color-accent-gold)] px-4 py-2 text-center text-xs uppercase"
          >
            Ver torneo
          </Link>
          <Link
            href="https://luma.com/vrmjtbg2"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-text btn-gold mt-4 inline-flex min-h-[40px] w-full items-center justify-center border-2 border-[var(--color-accent-gold)] px-4 py-2 text-center text-xs uppercase"
          >
            Inscribirse
          </Link>
        </div>
      </div>
    </li>
  );
}
