import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { computeTeamEloDeltas, ELO_K, expectedScore } from "@/lib/rating/team-elo";
import { DEFAULT_OG_IMAGES, absoluteUrl } from "@/lib/site-config";

const description =
  "Cómo se calcula el ranking ELO en Sportchain Padel: promedio por pareja, factor K, expectativa y ejemplo numérico con dos resultados posibles.";

export const metadata: Metadata = {
  title: "Cálculo del ranking ELO",
  description,
  openGraph: {
    title: "Cálculo del ranking ELO — Sportchain Padel",
    description,
    url: "/ranking/calculo",
    locale: "es_ES",
    images: DEFAULT_OG_IMAGES,
  },
  alternates: {
    canonical: absoluteUrl("/ranking/calculo"),
  },
};

export const revalidate = false;

const h2 = "mt-12 text-xl font-extrabold uppercase tracking-tight text-black sm:text-2xl";
const h3 = "mt-8 text-base font-extrabold uppercase tracking-tight text-black sm:text-lg";
const p = "mt-3 text-sm leading-relaxed text-[color:var(--color-subtle-text)] sm:text-base";
const code = "font-mono font-semibold text-black";
const formula =
  "mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-black px-4 py-3 font-mono text-xs leading-relaxed text-white sm:text-sm";

function signed(n: number) {
  return n > 0 ? `+${n}` : String(n);
}

function deltaClass(n: number) {
  if (n > 0) return "text-emerald-700";
  if (n < 0) return "text-rose-700";
  return "text-[var(--color-subtle-text)]";
}

function ResultTable({ rows }: { rows: Array<{ name: string; before: number; delta: number }> }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 shadow-sm">
      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-black text-white">
            <th className="px-3 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em]">Jugador</th>
            <th className="px-3 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
              Antes
            </th>
            <th className="px-3 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em]">Δ</th>
            <th className="px-3 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em]">
              Después
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-black/5 bg-[var(--color-surface)] even:bg-[var(--color-muted)]/50">
              <td className="px-3 py-2.5 font-semibold text-black">{r.name}</td>
              <td className="px-3 py-2.5 text-center tabular-nums text-[var(--color-subtle-text)]">{r.before}</td>
              <td className={`px-3 py-2.5 text-center font-bold tabular-nums ${deltaClass(r.delta)}`}>
                {signed(r.delta)}
              </td>
              <td className="px-3 py-2.5 text-center font-extrabold tabular-nums text-black">{r.before + r.delta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STEPS = [
  {
    title: "Promedio por pareja",
    text: "Se calcula la media aritmética del rating de los dos jugadores del mismo equipo.",
  },
  {
    title: "Expectativa",
    text: "Con esas dos medias se obtiene la probabilidad esperada de victoria de cada equipo.",
  },
  {
    title: "Resultado real",
    text: "El equipo ganador se trata como puntuación 1 y el perdedor como 0.",
  },
  {
    title: "Factor K y delta",
    text: `Se usa K = ${ELO_K}. El cambio de cada equipo es proporcional a la diferencia entre el resultado real y el esperado, y se redondea a entero.`,
  },
  {
    title: "Mismo delta por jugador",
    text: "Los dos jugadores del equipo 1 reciben exactamente el mismo incremento (o decremento); igual para el equipo 2.",
  },
] as const;

export default function RankingCalculoPage() {
  const rojo = 1350;
  const azul = 1250;
  const verde = 1200;
  const amarillo = 1200;

  const equipo1 = (rojo + azul) / 2;
  const equipo2 = (verde + amarillo) / 2;

  const ganaequipo1 = computeTeamEloDeltas(equipo1, equipo2, true);
  const ganaequipo2 = computeTeamEloDeltas(equipo1, equipo2, false);

  const exp1vs2 = expectedScore(equipo1, equipo2);
  const exp2vs1 = expectedScore(equipo2, equipo1);
  const exp1Pct = (exp1vs2 * 100).toFixed(1);
  const exp2Pct = (exp2vs1 * 100).toFixed(1);

  const teams = [
    {
      label: "Equipo 1",
      players: [
        { name: "Jugador Rojo", elo: rojo },
        { name: "Jugador Azul", elo: azul },
      ],
      average: equipo1,
    },
    {
      label: "Equipo 2",
      players: [
        { name: "Jugador Verde", elo: verde },
        { name: "Jugador Amarillo", elo: amarillo },
      ],
      average: equipo2,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="bg-gradient-to-b from-black via-neutral-950 to-neutral-800 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl py-8 sm:py-10">
          <Link
            href="/ranking"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/60 transition hover:text-white"
          >
            ← Ranking
          </Link>
          <div className="mt-6 pb-4 text-center">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-xs">
              Ranking ELO · Pádel
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-[#E3C273] sm:text-4xl md:text-5xl">
              ¿Cómo se calcula?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-white/80 sm:text-base">
              Promedio por pareja, expectativa de victoria y factor K: así se mueve tu ELO después de cada partido.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <h2 className={`${h2} mt-0`}>Pasos del cálculo</h2>
        <ol className="mt-5 space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black text-sm font-extrabold tabular-nums text-white">
                {i + 1}
              </span>
              <div className="pt-1">
                <p className="font-bold text-black">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-[color:var(--color-subtle-text)] sm:text-base">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className={h2}>Fórmula de la expectativa</h2>
        <p className={p}>
          Para la media del equipo A frente a la media del equipo B, la expectativa de victoria del equipo A es:
        </p>
        <pre className={formula}>{`Expectativa_A = 1 / ( 1 + 10^((Rating_B − Rating_A) / 400) )`}</pre>
        <p className={p}>
          Donde <span className={code}>Rating_A</span> y <span className={code}>Rating_B</span> son las medias de
          rating de cada equipo. La expectativa del equipo B es{" "}
          <span className={code}>Expectativa_B = 1 − Expectativa_A</span> con estas medias (o, equivalentemente, la
          misma fórmula intercambiando roles).
        </p>

        <h2 className={h2}>Cómo se calculan los deltas</h2>
        <p className={p}>
          Con las expectativas del <strong className="text-black">equipo 1</strong> (
          <span className={code}>Expectativa_1</span>) y del <strong className="text-black">equipo 2</strong> (
          <span className={code}>Expectativa_2</span>), que suman 1, se compara el resultado real del partido: el
          equipo ganador recibe puntuación <span className={code}>1</span> y el perdedor{" "}
          <span className={code}>0</span>. El cambio de rating de cada <em className="text-black">equipo</em> (y
          luego de cada jugador de ese equipo) sigue la regla estándar de Elo escalada por el factor{" "}
          <span className={code}>K = {ELO_K}</span>:
        </p>
        <pre className={formula}>
          {`Delta_1 = redondear( K × (Resultado_1 − Expectativa_1) )
Delta_2 = redondear( K × (Resultado_2 − Expectativa_2) )`}
        </pre>
        <p className={p}>
          <span className={code}>Resultado</span> es 1 si ese equipo gana el partido y 0 si pierde.{" "}
          <strong className="text-black">redondear</strong> es el entero más cercano (
          <span className={code}>Math.round</span> en el código). Los dos jugadores del equipo 1 suman exactamente{" "}
          <span className={code}>Delta_1</span> a su ELO cada uno; los dos del equipo 2 suman{" "}
          <span className={code}>Delta_2</span> cada uno. Si un equipo gana “de menos” (resultado 1 pero expectativa
          baja), el término <span className={code}>(Resultado − Expectativa)</span> es grande y positivo; si pierde
          “de más” (resultado 0 con expectativa alta), ese término es fuerte y negativo.
        </p>

        <h2 className={h2}>Ejemplo práctico</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <div key={team.label} className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--color-subtle-text)]">
                {team.label}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {team.players.map((pl) => (
                  <li key={pl.name} className="flex justify-between gap-3">
                    <span className="text-black">{pl.name}</span>
                    <span className="tabular-nums text-[var(--color-subtle-text)]">{pl.elo}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-black/10 pt-3">
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--color-subtle-text)]">
                  Media
                </span>
                <span className="text-2xl font-extrabold tabular-nums text-black">{team.average}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--color-subtle-text)]">
            Expectativa de victoria
          </p>
          <div className="mt-2 flex h-9 overflow-hidden rounded-lg text-xs font-extrabold tabular-nums">
            <div className="flex items-center bg-black px-3 text-white" style={{ width: `${exp1Pct}%` }}>
              Equipo 1 · {exp1Pct}%
            </div>
            <div
              className="flex items-center justify-end bg-[var(--color-muted)] px-3 text-black"
              style={{ width: `${exp2Pct}%` }}
            >
              {exp2Pct}% · Equipo 2
            </div>
          </div>
          <p className={p}>
            Antes de saber quién gana, la pareja Rojo/Azul es favorita porque su media es mayor.
          </p>
        </div>

        <h3 className={h3}>Si ganan Rojo y Azul (equipo 1)</h3>
        <p className={p}>
          Resultado real: equipo 1 = 1, equipo 2 = 0. Los deltas son: equipo 1{" "}
          <strong className={`tabular-nums ${deltaClass(ganaequipo1.delta1)}`}>{signed(ganaequipo1.delta1)}</strong>,
          equipo 2{" "}
          <strong className={`tabular-nums ${deltaClass(ganaequipo1.delta2)}`}>{signed(ganaequipo1.delta2)}</strong>.
        </p>
        <ResultTable
          rows={[
            { name: "Jugador Rojo", before: rojo, delta: ganaequipo1.delta1 },
            { name: "Jugador Azul", before: azul, delta: ganaequipo1.delta1 },
            { name: "Jugador Verde", before: verde, delta: ganaequipo1.delta2 },
            { name: "Jugador Amarillo", before: amarillo, delta: ganaequipo1.delta2 },
          ]}
        />
        <p className="mt-3 font-mono text-xs text-[var(--color-subtle-text)]">
          E₁ ≈ {ganaequipo1.expected1.toFixed(4)} · resultado equipo 1 = {ganaequipo1.actual1} · Δ₁ = round({ELO_K} × (
          {ganaequipo1.actual1} − {ganaequipo1.expected1.toFixed(4)})) = {ganaequipo1.delta1}
        </p>

        <h3 className={h3}>Si ganan Verde y Amarillo (equipo 2)</h3>
        <p className={p}>
          Mismas medias ({equipo1} vs {equipo2}), pero ahora el resultado real favorece al equipo 2. Los deltas son:
          equipo 1{" "}
          <strong className={`tabular-nums ${deltaClass(ganaequipo2.delta1)}`}>{signed(ganaequipo2.delta1)}</strong>,
          equipo 2{" "}
          <strong className={`tabular-nums ${deltaClass(ganaequipo2.delta2)}`}>{signed(ganaequipo2.delta2)}</strong>.
          La sorpresa (vencer siendo inferiores en media) se traduce en un bonus mayor para el equipo 2 y una
          penalización mayor para el equipo 1.
        </p>
        <ResultTable
          rows={[
            { name: "Jugador Rojo", before: rojo, delta: ganaequipo2.delta1 },
            { name: "Jugador Azul", before: azul, delta: ganaequipo2.delta1 },
            { name: "Jugador Verde", before: verde, delta: ganaequipo2.delta2 },
            { name: "Jugador Amarillo", before: amarillo, delta: ganaequipo2.delta2 },
          ]}
        />
        <p className="mt-3 font-mono text-xs text-[var(--color-subtle-text)]">
          E₁ ≈ {ganaequipo2.expected1.toFixed(4)} · resultado equipo 1 = {ganaequipo2.actual1} · Δ₁ ={" "}
          {ganaequipo2.delta1} · E₂ ≈ {ganaequipo2.expected2.toFixed(4)} · resultado equipo 2 = {ganaequipo2.actual2}{" "}
          · Δ₂ = {signed(ganaequipo2.delta2)}
        </p>

        <section className="mt-12 rounded-lg border border-black/10 bg-[var(--color-muted)]/50 p-5 sm:p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-black">Nota final</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-subtle-text)]">
            Este texto describe el comportamiento del software actual. Si en el futuro se cambia el factor{" "}
            <span className={code}>K</span> o la lógica de equipos, los números del ejemplo dejarían de coincidir; la
            fuente de verdad sigue siendo el código y las tablas de base de datos de partidos y logs de rating.
          </p>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/ranking"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-black/25 px-6 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black hover:bg-black hover:text-white"
          >
            Volver al ranking
          </Link>
        </div>
      </main>
    </div>
  );
}
