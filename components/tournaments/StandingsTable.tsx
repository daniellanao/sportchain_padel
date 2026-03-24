export type StandingsTableRow = {
  rank: number;
  teamName: string;
  points: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesLost: number;
  gamesDifference: number;
  buchholz: number;
};

type StandingsTableProps = {
  rows: StandingsTableRow[];
  title?: string;
  emptyLabel?: string;
};

export function StandingsTable({
  rows,
  title = "Standings",
  emptyLabel = "Aun no hay standings para este torneo.",
}: StandingsTableProps) {
  return (
    <section className="mb-10">
      <h2 className="navbar-text mb-4 text-xs uppercase tracking-[0.12em] text-[var(--color-primary)]">
        {title}
      </h2>
      <div className="overflow-x-auto border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">#</th>
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">Team</th>              
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">MP</th>
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">W</th>
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">L</th>
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">GW</th>
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">GL</th>
              <th className="navbar-text whitespace-nowrap px-2 py-2 sm:px-3">Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="bg-[var(--color-surface)]">
                <td colSpan={9} className="px-3 py-3 text-[var(--color-subtle-text)]">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.teamName}-${row.rank}`}
                  className={
                    i % 2 === 0
                      ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                      : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                  }
                >
                  <td className="px-2 py-2 font-mono tabular-nums text-[var(--color-primary)] sm:px-3">
                    {row.rank}
                  </td>
                  <td className="max-w-[260px] px-2 py-2 font-medium sm:px-3">{row.teamName}</td>                  
                  <td className="px-2 py-2 tabular-nums sm:px-3">{row.matchesPlayed}</td>
                  <td className="px-2 py-2 tabular-nums sm:px-3">{row.matchesWon}</td>
                  <td className="px-2 py-2 tabular-nums sm:px-3">{row.matchesLost}</td>
                  <td className="px-2 py-2 tabular-nums sm:px-3">{row.gamesWon}</td>
                  <td className="px-2 py-2 tabular-nums sm:px-3">{row.gamesLost}</td>
                  <td className="px-2 py-2 tabular-nums sm:px-3">{row.gamesDifference}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
