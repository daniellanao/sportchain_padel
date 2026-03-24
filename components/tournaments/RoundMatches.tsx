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
}: RoundMatchesProps) {
  return (
    <section className="mb-10">
      <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
        {title}
      </h2>
      <div className="flex flex-col gap-8">
        {rounds.map((round) => (
          <div key={round.roundNumber}>
            <h3 className="mb-3 border-b-2 border-[var(--color-accent-gold)] pb-2 text-sm font-black uppercase text-[var(--color-primary)] sm:text-base">
              {round.label}
            </h3>
            {round.matches.length === 0 ? (
              <p className="text-xs text-[var(--color-subtle-text)]">{emptyRoundLabel}</p>
            ) : (
              <div className="overflow-hidden border-2 border-[var(--color-primary)]">
                <table className="w-full table-fixed border-collapse text-left text-[11px] sm:text-xs">
                  <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[38%]" />
                    <col className="w-[16%]" />
                    <col className="w-[38%]" />
                    
                  </colgroup>
                  <thead>
                    <tr className="border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                      <th className="px-1 py-1.5 text-center sm:px-2">#</th>
                      <th className="px-1 py-1.5 sm:px-2">Equipo 1</th>
                      <th className="px-1 py-1.5 text-center sm:px-2">G1-G2</th>
                      <th className="px-1 py-1.5 sm:px-2">Equipo 2</th>                      
                    </tr>
                  </thead>
                  <tbody>
                    {round.matches.map((m, index) => (
                      <tr
                        key={m.id}
                        className={
                          index % 2 === 0
                            ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/40"
                            : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                        }
                      >
                        <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2">
                          {index + 1}
                        </td>
                        <td className="truncate px-1 py-1.5 font-medium sm:px-2">
                          <span className="inline-flex items-center gap-1">
                            {isTeam1Winner(m) ? (
                              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-emerald-600" title="Ganador" />
                            ) : isTeam2Winner(m) ? (
                              <FontAwesomeIcon icon={faTimes} className="h-3 w-3 text-red-600" title="Perdedor" />
                            ) : null}
                            <span className="truncate">{m.team1Name}</span>
                          </span>
                        </td>
                        <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2">
                          {m.team1Games} - {m.team2Games}
                        </td>
                        <td className="truncate px-1 py-1.5 font-medium sm:px-2">
                          <span className="inline-flex items-center gap-1">
                            {isTeam2Winner(m) ? (
                              <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-emerald-600" title="Ganador" />
                            ) : isTeam1Winner(m) ? (
                              <FontAwesomeIcon icon={faTimes} className="h-3 w-3 text-red-600" title="Perdedor" />
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
