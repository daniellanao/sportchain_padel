import { faCalendarDays, faClock, faTag } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import {
  buildOpenTournamentWhatsappMessage,
  type OpenTournamentPublicItem,
} from "@/lib/open-tournaments/public-list";
import { isRemoteImageSrc } from "@/lib/image-remote";

export type TournamentCommunityCardProps = {
  tournament: OpenTournamentPublicItem;
};

function waMeUrlWithText(e164: string, message: string): string {
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Torneo abierto (comunidad): 1) título · 2) imagen organizador + fecha/hora/categoría ·
 * 3) sede y dirección · 4) WhatsApp del organizador.
 */
export function TournamentCommunityCard({ tournament: t }: TournamentCommunityCardProps) {
  const waMessage = buildOpenTournamentWhatsappMessage(t);
  const waDigits = t.organizerWhatsapp?.replace(/\D/g, "") ?? "";
  const waUrl =
    waDigits.length > 0 ? waMeUrlWithText(t.organizerWhatsapp ?? "", waMessage) : null;

  const hasVenue = Boolean(t.venueName?.trim() || t.venueAddress?.trim());

  return (
    <li data-open-tournament-id={t.id} className="flex h-full min-h-0">
      <div className="flex min-h-0 w-full min-w-0 flex-col border-4 border-[var(--color-primary)] bg-[var(--color-muted)]/50 shadow-[6px_6px_0_rgba(0,0,0,0.15)]">
        {/* 1 — Título */}
        <div className="border-b-2 border-[var(--color-primary)]/15 px-2.5 pb-2 pt-2.5 sm:px-3 sm:pb-2.5 sm:pt-3">
          <h3 className="line-clamp-3 min-w-0 text-center text-xs font-black uppercase leading-tight text-[var(--color-primary)] sm:text-sm">
            {t.name}
          </h3>
        </div>

        {/* 2 — Imagen cuadrada | Fecha, Hora, Categoría */}
        <div className="flex flex-row gap-2.5 p-2.5 sm:gap-3 sm:p-3">
          <div className="relative aspect-square w-[4.25rem] shrink-0 self-start overflow-hidden border-2 border-[var(--color-accent-gold)] bg-[var(--color-surface)] sm:w-24 md:w-28">
            {t.organizerImageUrl ? (
              <Image
                src={t.organizerImageUrl}
                alt={t.name}
                fill
                className="object-cover"
                sizes="80px, 112px"
                unoptimized={isRemoteImageSrc(t.organizerImageUrl)}
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,var(--color-muted)_0%,var(--color-surface)_100%)] text-[10px] font-bold uppercase text-[var(--color-subtle-text)]"
                aria-hidden
              >
                {t.organizerName.slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1.5 text-[10px] sm:text-xs">
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
            <div className="flex gap-1.5">
              <FontAwesomeIcon
                icon={faClock}
                className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-primary)]"
                aria-hidden
              />
              <div className="min-w-0">
                <span className="navbar-text block text-[9px] uppercase text-[var(--color-subtle-text)]">Hora</span>
                <span className="font-medium leading-snug text-[var(--color-foreground)]">{t.timeLabel}</span>
              </div>
            </div>
            {t.category?.trim() ? (
              <div className="flex gap-1.5">
                <FontAwesomeIcon
                  icon={faTag}
                  className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-primary)]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <span className="navbar-text block text-[9px] uppercase text-[var(--color-subtle-text)]">
                    Categoría
                  </span>
                  <span className="font-medium leading-snug text-[var(--color-foreground)]">{t.category}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* 3 — Nombre sede, dirección debajo */}
        {hasVenue ? (
          <div className="border-t-2 border-[var(--color-primary)]/15 px-2.5 py-2 sm:px-3 sm:py-2.5">
            {t.venueName?.trim() ? (
              <p className="text-center text-[11px] font-bold uppercase leading-snug text-[var(--color-primary)] sm:text-xs">
                {t.venueName.trim()}
              </p>
            ) : null}
            {t.venueAddress?.trim() ? (
              <p className="mt-1 text-center text-[10px] leading-snug text-[var(--color-subtle-text)] sm:text-[11px]">
                {t.venueAddress.trim()}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* 4 — WhatsApp organizador */}
        <div className="mt-auto border-t-2 border-[var(--color-primary)]/20 px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3 sm:pt-2.5">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-text inline-flex min-h-[36px] w-full items-center justify-center gap-2 border-2 border-[#128C7E] bg-[#25D366] px-2 py-1.5 text-center text-[9px] font-bold uppercase text-white shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition hover:brightness-105 sm:min-h-[40px] sm:text-[10px]"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4 shrink-0" aria-hidden />
              Consultar por WhatsApp
            </a>
          ) : (
            <p className="text-center text-[10px] text-[var(--color-subtle-text)]">
              Sin WhatsApp del organizador
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
