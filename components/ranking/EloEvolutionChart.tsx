export type EloPoint = {
  date: string;
  elo: number;
};

type EloEvolutionChartProps = {
  /** Chronological order, oldest first. */
  points: EloPoint[];
};

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

/**
 * ELO line chart. The SVG stretches to the container (`preserveAspectRatio="none"`),
 * so labels and the current-value marker are HTML positioned in percentages.
 */
export function EloEvolutionChart({ points }: EloEvolutionChartProps) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-[var(--color-subtle-text)]">
        Se necesitan al menos dos partidos para mostrar la evolución del ELO.
      </p>
    );
  }

  const values = points.map((p) => p.elo);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = Math.max(10, Math.round((rawMax - rawMin) * 0.15));
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * 100,
    y: (1 - (p.elo - min) / range) * 100,
  }));

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const area = `${line} L100,100 L0,100 Z`;
  const last = coords[coords.length - 1];
  const current = values[values.length - 1];

  const gridValues = [max, Math.round((max + min) / 2), min];

  return (
    <div>
      <div className="flex gap-2 sm:gap-3">
        <div className="relative w-10 shrink-0 text-right text-[0.6875rem] tabular-nums text-[var(--color-subtle-text)]">
          {gridValues.map((v, i) => (
            <span
              key={i}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${(i / (gridValues.length - 1)) * 100}%` }}
            >
              {Math.round(v)}
            </span>
          ))}
        </div>

        <div className="relative h-56 flex-1 sm:h-72">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            role="img"
            aria-label={`Evolución del ELO de ${values[0]} a ${current} en ${points.length - 1} partidos`}
          >
            {gridValues.map((_, i) => {
              const y = (i / (gridValues.length - 1)) * 100;
              return (
                <line
                  key={i}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-black/10"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            <path d={area} className="fill-black/5" />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="text-black"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-[#E3C273]"
            style={{ left: `${last.x}%`, top: `${last.y}%` }}
            aria-hidden
          />
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-12 text-[0.6875rem] text-[var(--color-subtle-text)] sm:pl-[3.25rem]">
        <span>{formatShortDate(points[0].date)}</span>
        <span>{formatShortDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}
