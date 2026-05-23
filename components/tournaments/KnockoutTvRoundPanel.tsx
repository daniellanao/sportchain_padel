import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { RoundMatchRow } from "@/components/tournaments/RoundMatches";

function headerTextColor(bg: string): string {
  const hex = bg.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0b1f3b" : "#ffffff";
}

function isTeam1Winner(match: RoundMatchRow): boolean {
  return match.finished && match.team1Games > match.team2Games;
}

function isTeam2Winner(match: RoundMatchRow): boolean {
  return match.finished && match.team2Games > match.team1Games;
}

type KnockoutTvRoundPanelProps = {
  title: string;
  headerColor: string;
  matches: RoundMatchRow[];
  emptyLabel?: string;
  layout?: "stack" | "grid-2";
  condensed?: boolean;
  /** Equal-height match cards that grow to fill the section (tvdark2). */
  uniformMatchHeight?: boolean;
  className?: string;
};

function MatchCard({
  match,
  accentColor,
  uniformMatchHeight = false,
}: {
  match: RoundMatchRow;
  accentColor: string;
  uniformMatchHeight?: boolean;
}) {
  const score =
    match.finished || match.team1Games > 0 || match.team2Games > 0
      ? `${match.team1Games} – ${match.team2Games}`
      : "—";

  const cellPad = uniformMatchHeight ? "px-2 py-1 sm:px-2.5 sm:py-1.5" : "px-2 py-1.5 sm:px-3";
  const cellClass = uniformMatchHeight
    ? `flex h-full min-h-0 items-center overflow-hidden ${cellPad}`
    : "flex min-h-[2.75rem] items-center px-2 py-1.5 sm:min-h-[3.25rem] sm:px-3";

  const iconClass = uniformMatchHeight ? "h-3.5 w-3.5 shrink-0" : "h-3 w-3 shrink-0";
  const teamNameClass = uniformMatchHeight
    ? "min-w-0 flex-1 break-words font-bold leading-snug text-[length:var(--knockout-match-font-size)] [overflow-wrap:anywhere] line-clamp-3"
    : "truncate font-bold leading-tight";
  const scoreClass = uniformMatchHeight
    ? "text-[length:var(--knockout-score-font-size)]"
    : "text-[1.05em] sm:text-[1.1em]";
  const scoreMinW = uniformMatchHeight ? "min-w-[3rem] sm:min-w-[3.5rem]" : "min-w-[2.75rem] sm:min-w-[3.25rem]";

  return (
    <div
      className={
        uniformMatchHeight
          ? "knockout-match-card flex h-full min-h-[var(--knockout-match-min-height)] min-w-0 flex-col overflow-hidden rounded border-2 bg-[var(--color-surface)] shadow-[3px_3px_0_rgba(0,0,0,0.35)]"
          : "min-h-0 overflow-hidden rounded border-2 bg-[var(--color-surface)] shadow-[3px_3px_0_rgba(0,0,0,0.35)]"
      }
      style={{ borderColor: accentColor }}
    >
      <div
        className={
          uniformMatchHeight
            ? "grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch"
            : "grid grid-cols-[1fr_auto_1fr] items-stretch gap-0 border-b border-[var(--color-muted)]"
        }
      >
        <div className={`${cellClass} ${isTeam1Winner(match) ? "bg-emerald-500/15" : ""}`}>
          <span className="inline-flex w-full min-w-0 items-center gap-1.5">
            {isTeam1Winner(match) ? (
              <FontAwesomeIcon icon={faCheck} className={`${iconClass} text-emerald-400`} aria-hidden />
            ) : isTeam2Winner(match) ? (
              <FontAwesomeIcon icon={faTimes} className={`${iconClass} text-red-400`} aria-hidden />
            ) : null}
            <span className={teamNameClass} title={match.team1Name}>
              {match.team1Name}
            </span>
          </span>
        </div>
        <div
          className={`flex h-full ${scoreMinW} shrink-0 flex-col items-center justify-center border-x-2 px-1.5 font-mono font-black tabular-nums sm:px-2 ${scoreClass}`}
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {score}
        </div>
        <div
          className={`${cellClass} justify-end text-right ${isTeam2Winner(match) ? "bg-emerald-500/15" : ""}`}
        >
          <span className="inline-flex w-full min-w-0 items-center justify-end gap-1.5">
            <span className={`${teamNameClass} text-right`} title={match.team2Name}>
              {match.team2Name}
            </span>
            {isTeam2Winner(match) ? (
              <FontAwesomeIcon icon={faCheck} className={`${iconClass} text-emerald-400`} aria-hidden />
            ) : isTeam1Winner(match) ? (
              <FontAwesomeIcon icon={faTimes} className={`${iconClass} text-red-400`} aria-hidden />
            ) : null}
          </span>
        </div>
      </div>
    </div>
  );
}

function matchGridClassFor(
  layout: "stack" | "grid-2",
  uniformMatchHeight: boolean,
  matchCount: number,
): string {
  if (!uniformMatchHeight) {
    if (layout === "grid-2") {
      return "grid min-h-0 flex-1 grid-cols-2 auto-rows-auto content-start gap-1.5 sm:gap-2";
    }
    return "flex min-h-0 flex-1 flex-col gap-1.5 sm:gap-2";
  }

  if (layout === "grid-2") {
    const rows = matchCount > 2 ? "grid-rows-2" : "grid-rows-1";
    return `grid h-full min-h-0 flex-1 grid-cols-2 ${rows} gap-1.5 sm:gap-2`;
  }

  return "flex h-full min-h-0 flex-1 flex-col gap-1.5 sm:gap-2";
}

/** Knockout phase panel for TV (cuartos, semis, final). */
export function KnockoutTvRoundPanel({
  title,
  headerColor,
  matches,
  emptyLabel = "Partidos por definir.",
  layout = "stack",
  condensed = false,
  uniformMatchHeight = false,
  className = "",
}: KnockoutTvRoundPanelProps) {
  const headerFg = headerTextColor(headerColor);
  const matchGridClass = matchGridClassFor(layout, uniformMatchHeight, matches.length);

  const sectionGrow =
    uniformMatchHeight || !(condensed && layout === "grid-2") ? "min-h-0 flex-1" : "shrink-0";

  const contentWrapClass = uniformMatchHeight
    ? "flex min-h-0 flex-1 flex-col p-1.5 sm:p-2"
    : condensed && layout === "grid-2"
      ? "shrink-0 p-1.5"
      : "min-h-0 flex-1 p-1.5 sm:p-2";

  const titleBarClass = uniformMatchHeight
    ? "flex h-[var(--knockout-section-title-height)] shrink-0 items-center justify-center rounded-t border-2 border-b-0 px-2 text-center text-[length:clamp(0.72rem,1.15vw,1.05rem)] font-black uppercase leading-tight tracking-[0.14em]"
    : condensed
      ? "shrink-0 rounded-t border-2 border-b-0 px-2 py-0.5 text-center text-[length:clamp(0.55rem,0.95vw,0.8rem)] font-black uppercase tracking-[0.12em]"
      : "shrink-0 rounded-t border-2 border-b-0 px-2 py-1.5 text-center text-[length:clamp(0.65rem,1.1vw,0.95rem)] font-black uppercase tracking-[0.14em] sm:py-2";

  return (
    <section className={`flex min-h-0 min-w-0 flex-col ${sectionGrow} ${className}`.trim()}>
      <div
        className={titleBarClass}
        style={{ backgroundColor: headerColor, borderColor: headerColor, color: headerFg }}
      >
        {title}
      </div>
      <div
        className={`min-h-0 overflow-hidden rounded-b border-2 border-t-0 bg-[var(--color-muted)]/30 ${contentWrapClass}`}
        style={{ borderColor: headerColor }}
      >
        <div className={matchGridClass}>
          {matches.length === 0 ? (
            <p
              className={`flex items-center justify-center px-2 py-6 text-center text-[0.95em] text-[var(--color-subtle-text)] ${
                layout === "grid-2" ? "col-span-2 h-full" : "flex-1"
              }`}
            >
              {emptyLabel}
            </p>
          ) : (
            matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                accentColor={headerColor}
                uniformMatchHeight={uniformMatchHeight}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
