import {
  faCalendarDays,
  faClock,
  faLayerGroup,
  faMapMarkerAlt,
  faTrophy,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

import { getCommunityTournamentWhatsappMessage, type CommunityTournament } from "@/data/tournaments";
import { isRemoteImageSrc } from "@/lib/image-remote";

export type TournamentCommunityCardProps = {
  tournament: CommunityTournament;
};

function waMeUrlWithText(e164: string, message: string): string {
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const rowLabelClass =
  "inline-flex items-center gap-2 text-[var(--color-subtle-text)]";

/**
 * Tarjeta tipo «próximo torneo» para eventos de comunidad / externos (CTA WhatsApp).
 */
export function TournamentCommunityCard({ tournament: t }: TournamentCommunityCardProps) {
  const waMessage = getCommunityTournamentWhatsappMessage(t);
  const waUrl = waMeUrlWithText(t.whatsappE164, waMessage);

  return (
    <li
      data-community-id={t.id}
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
              unoptimized={isRemoteImageSrc(t.imageUrl)}
            />
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-2">           
            <h3 className="block min-w-0 text-base font-black uppercase leading-tight text-[var(--color-primary)] sm:text-lg">
              {t.name}
            </h3>
          </div>

          <table className="w-full flex-1 border-collapse text-sm">
            <tbody>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className={rowLabelClass}>
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
                  <span className={rowLabelClass}>
                    <FontAwesomeIcon
                      icon={faClock}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Hora</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.timeLabel}</td>
              </tr>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className={rowLabelClass}>
                    <FontAwesomeIcon
                      icon={faLayerGroup}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Formato</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.formatLabel}</td>
              </tr>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className={rowLabelClass}>
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Categoría</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.category}</td>
              </tr>
              <tr className="border-b border-[var(--color-foreground)]/10">
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className={rowLabelClass}>
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Sede</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.venue}</td>
              </tr>
              <tr>
                <th scope="row" className="w-0 py-2 pr-2 align-middle text-left font-normal">
                  <span className={rowLabelClass}>
                    <FontAwesomeIcon
                      icon={faTrophy}
                      className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]"
                      aria-hidden
                    />
                    <span className="navbar-text text-[10px] uppercase">Organiza</span>
                  </span>
                </th>
                <td className="py-2 pl-1 font-medium text-[var(--color-foreground)]">{t.organizer}</td>
              </tr>
            </tbody>
          </table>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-text mt-4 inline-flex min-h-[40px] w-full items-center justify-center gap-2 border-2 border-[#128C7E] bg-[#25D366] px-4 py-2 text-center text-xs font-bold uppercase text-white shadow-[3px_3px_0_rgba(0,0,0,0.2)] transition hover:brightness-105"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" aria-hidden />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </li>
  );
}
