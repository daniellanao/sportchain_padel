import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type RoundMatchRow = {
  id: number;
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
};

function isTeam1Winner(match: RoundMatchRow): boolean {
  return match.finished && match.team1Games > match.team2Games;
}

function isTeam2Winner(match: RoundMatchRow): boolean {
  return match.finished && match.team2Games > match.team1Games;
}

export function RoundMatches({
  rounds,
  title = "Partidos por ronda",
  emptyRoundLabel = "Sin partidos en esta ronda.",
  compact = false,
}: RoundMatchesProps) {
  const showSectionTitle = Boolean(title?.trim());

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
                  compact ? "overflow-hidden border border-[var(--color-primary)]" : "overflow-hidden border-2 border-[var(--color-primary)]"
                }
              >
                <table
                  className={
                    compact
                      ? "w-full table-fixed border-collapse text-left text-inherit leading-tight [&_td]:px-0.5 [&_td]:py-px [&_th]:px-0.5 [&_th]:py-px"
                      : "w-full table-fixed border-collapse text-left text-[11px] sm:text-xs"
                  }
                >
                  <colgroup>
                    <col className="w-[42%]" />
                    <col className="w-[16%]" />
                    <col className="w-[42%]" />
                  </colgroup>
                  <thead>
                    <tr
                      className={
                        compact
                          ? "border-b border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      }
                    >
                      <th className="px-1 py-1.5 sm:px-2">Equipo 1</th>
                      <th className="px-1 py-1.5 text-center sm:px-2">G1-G2</th>
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
