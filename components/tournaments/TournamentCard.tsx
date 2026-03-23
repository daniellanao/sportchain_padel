import Image from "next/image";

import { formatTournamentFormatLabel, type Tournament } from "@/data/tournaments";
import { isRemoteImageSrc } from "@/lib/image-remote";

function statusLabel(status: Tournament["status"]): string {
  switch (status) {
    case "upcoming":
      return "Próximo";
    case "completed":
      return "Finalizado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

export type TournamentCardProps = {
  tournament: Tournament;
};

/**
 * Summary card for a tournament detail page: image, title, and key metadata.
 */
export function TournamentCard({ tournament: t }: TournamentCardProps) {
  return (
    <header className="mb-8 border-4 border-[var(--color-accent-gold)] bg-[var(--color-surface)] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.15)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
        {t.imageUrl ? (
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-muted)] lg:max-w-md">
            <Image
              src={t.imageUrl}
              alt={t.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 400px"
              priority
              unoptimized={isRemoteImageSrc(t.imageUrl)}
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="navbar-text mb-1 text-xs uppercase tracking-[0.15em] text-[var(--color-primary)]">
            {statusLabel(t.status)}
          </p>
          <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
            {t.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--color-subtle-text)]">{t.slug}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">Fecha</dt>
              <dd className="font-medium">{t.dateLabel}</dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                Hora de inicio
              </dt>
              <dd className="font-medium">{t.timeLabel}</dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                Jugadores (máx.)
              </dt>
              <dd className="font-medium tabular-nums">{t.playerCount}</dd>
            </div>
            <div>
              <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">Formato</dt>
              <dd className="font-medium">{formatTournamentFormatLabel(t)}</dd>
            </div>
            {t.minElo != null ? (
              <div>
                <dt className="navbar-text text-[10px] uppercase text-[var(--color-subtle-text)]">
                  ELO mínimo
                </dt>
                <dd className="font-medium tabular-nums">{t.minElo}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </header>
  );
}
