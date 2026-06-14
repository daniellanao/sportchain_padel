import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type RoundMatchRow = {
  id: number;
  court: number | null;
  team1Name: string;
  team2Name: string;
  team1Games: number;
  team2Games: number;
  status: string;
  finished: boolean;
};

export type RoundMatchesRound = {
  roundNumber: number;
  label: string;
  matches: RoundMatchRow[];
};

type RoundMatchesProps = {
  rounds: RoundMatchesRound[];
  title?: string;
  emptyRoundLabel?: string;
  /** Tighter spacing and smaller type for kiosk / TV (no scroll). */
  compact?: boolean;
  /** Table header row background (e.g. per-round color on TV). */
  headerColor?: string;
  /** Hide the court (C) column. */
  hideCourtColumn?: boolean;
  /** Score column header (default G1-G2). */
  scoreColumnLabel?: string;
};

function isTeam1Winner(match: RoundMatchRow): boolean {
  return match.finished && match.team1Games > match.team2Games;
}

function isTeam2Winner(match: RoundMatchRow): boolean {
  return match.finished && match.team2Games > match.team1Games;
}

function headerTextColor(bg: string): string {
  const hex = bg.replace("#", "");
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#0b1f3b" : "#ffffff";
}

export function RoundMatches({
  rounds,
  title = "Partidos por ronda",
  emptyRoundLabel = "Sin partidos en esta ronda.",
  compact = false,
  headerColor,
  hideCourtColumn = false,
  scoreColumnLabel = "G1-G2",
}: RoundMatchesProps) {
  const showSectionTitle = Boolean(title?.trim());
  const headerStyle = headerColor
    ? {
        borderColor: headerColor,
        backgroundColor: headerColor,
        color: headerTextColor(headerColor),
      }
    : undefined;

  return (
    <section className={compact ? "mb-0 min-h-0" : "mb-10"}>
      {showSectionTitle ? (
        <h2
          className={
            compact
              ? "navbar-text mb-0.5 text-[1em] uppercase leading-tight tracking-[0.1em] text-[var(--color-primary)]"
              : "navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]"
          }
        >
          {title}
        </h2>
      ) : null}
      <div
        className={
          compact
            ? showSectionTitle
              ? "flex flex-col gap-1"
              : "flex flex-col gap-0.5"
            : "flex flex-col gap-8"
        }
      >
        {rounds.map((round) => (
          <div key={round.roundNumber}>
            <h3
              className={
                compact
                  ? "mb-0.5 border-b border-[var(--color-accent-gold)] pb-0.5 text-[0.95em] font-black uppercase leading-tight text-[var(--color-primary)]"
                  : "mb-3 border-b-2 border-[var(--color-accent-gold)] pb-2 text-sm font-black uppercase text-[var(--color-primary)] sm:text-base"
              }
            >
              {round.label}
            </h3>
            {round.matches.length === 0 ? (
              <p
                className={
                  compact ? "text-[0.9em] text-[var(--color-subtle-text)]" : "text-xs text-[var(--color-subtle-text)]"
                }
              >
                {emptyRoundLabel}
              </p>
            ) : (
              <div
                className={
                  compact
                    ? headerColor
                      ? "overflow-hidden border"
                      : "overflow-hidden border border-[var(--color-primary)]"
                    : headerColor
                      ? "overflow-hidden border-2"
                      : "overflow-hidden border-2 border-[var(--color-primary)]"
                }
                style={headerColor ? { borderColor: headerColor } : undefined}
              >
                <table
                  className={
                    compact
                      ? "w-full table-fixed border-collapse text-left text-inherit leading-tight [&_td]:px-0.5 [&_td]:py-px [&_th]:px-0.5 [&_th]:py-px"
                      : "w-full table-fixed border-collapse text-left text-[11px] sm:text-xs"
                  }
                >
                  <colgroup>
                    {hideCourtColumn ? (
                      <>
                        <col className="w-[42%]" />
                        <col className="w-[16%]" />
                        <col className="w-[42%]" />
                      </>
                    ) : (
                      <>
                        <col className="w-[10%]" />
                        <col className="w-[38%]" />
                        <col className="w-[14%]" />
                        <col className="w-[38%]" />
                      </>
                    )}
                  </colgroup>
                  <thead>
                    <tr
                      className={
                        headerColor
                          ? compact
                            ? "border-b"
                            : "border-b-2"
                          : compact
                            ? "border-b border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      }
                      style={headerStyle}
                    >
                      {hideCourtColumn ? null : (
                        <th className="px-1 py-1.5 text-center sm:px-2">C</th>
                      )}
                      <th className="px-1 py-1.5 sm:px-2">Equipo 1</th>
                      <th className="px-1 py-1.5 text-center sm:px-2">{scoreColumnLabel}</th>
                      <th className="px-1 py-1.5 sm:px-2">Equipo 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {round.matches.map((m, rowIdx) => (
                      <tr
                        key={m.id}
                        className={
                          rowIdx % 2 === 0
                            ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/40"
                            : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                        }
                      >
                        {hideCourtColumn ? null : (
                          <td className="px-1 py-1.5 text-center font-mono tabular-nums text-[var(--color-subtle-text)] sm:px-2">
                            {m.court != null ? `C${m.court}` : "—"}
                          </td>
                        )}
                        <td className="truncate px-1 py-1.5 font-medium sm:px-2">
                          <span className="inline-flex items-center gap-0.5">
                            {isTeam1Winner(m) ? (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className={compact ? "h-2 w-2 text-emerald-600" : "h-3 w-3 text-emerald-600"}
                                title="Ganador"
                              />
                            ) : isTeam2Winner(m) ? (
                              <FontAwesomeIcon
                                icon={faTimes}
                                className={compact ? "h-2 w-2 text-red-600" : "h-3 w-3 text-red-600"}
                                title="Perdedor"
                              />
                            ) : null}
                            <span className="truncate">{m.team1Name}</span>
                          </span>
                        </td>
                        <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2">
                          {m.team1Games} - {m.team2Games}
                        </td>
                        <td className="truncate px-1 py-1.5 font-medium sm:px-2">
                          <span className="inline-flex items-center gap-0.5">
                            {isTeam2Winner(m) ? (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className={compact ? "h-2 w-2 text-emerald-600" : "h-3 w-3 text-emerald-600"}
                                title="Ganador"
                              />
                            ) : isTeam1Winner(m) ? (
                              <FontAwesomeIcon
                                icon={faTimes}
                                className={compact ? "h-2 w-2 text-red-600" : "h-3 w-3 text-red-600"}
                                title="Perdedor"
                              />
                            ) : null}
                            <span className="truncate">{m.team2Name}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
