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
      <div className="overflow-hidden border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
        <table className="w-full table-fixed border-collapse text-left text-[10px] sm:text-sm">
          <colgroup>
            <col className="w-[8%]" />
            <col className="w-[34%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">#</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 sm:px-2 sm:py-2">Team</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">MP</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">W</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">L</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">GW</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">GL</th>
              <th className="navbar-text whitespace-nowrap px-1 py-1.5 text-center sm:px-2 sm:py-2">Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="bg-[var(--color-surface)]">
                <td colSpan={8} className="px-2 py-3 text-center text-[var(--color-subtle-text)]">
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
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums text-[var(--color-primary)] sm:px-2 sm:py-2">
                    {row.rank}
                  </td>
                  <td className="truncate px-1 py-1.5 font-medium sm:px-2 sm:py-2">{row.teamName}</td>
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2 sm:py-2">
                    {row.matchesPlayed}
                  </td>
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2 sm:py-2">
                    {row.matchesWon}
                  </td>
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2 sm:py-2">
                    {row.matchesLost}
                  </td>
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2 sm:py-2">
                    {row.gamesWon}
                  </td>
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2 sm:py-2">
                    {row.gamesLost}
                  </td>
                  <td className="px-1 py-1.5 text-center font-mono tabular-nums sm:px-2 sm:py-2">
                    {row.gamesDifference}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
