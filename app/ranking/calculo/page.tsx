import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { computeTeamEloDeltas, ELO_K, expectedScore } from "@/lib/rating/team-elo";
import { absoluteUrl } from "@/lib/site-config";

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
  },
  alternates: {
    canonical: absoluteUrl("/ranking/calculo"),
  },
};

export const revalidate = false;

const card =
  "rounded-xl border border-foreground/15 bg-surface p-5 shadow-sm sm:p-6";
const h2 = "mt-10 text-lg font-bold uppercase tracking-wide text-[var(--color-primary)] sm:text-xl";
const h3 = "mt-6 text-base font-semibold text-foreground sm:text-lg";
const p = "mt-3 text-sm leading-relaxed text-[color:var(--color-subtle-text)] sm:text-base";
const mono = "rounded-lg border border-foreground/10 bg-muted/40 px-3 py-2 font-mono text-xs text-foreground sm:text-sm";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <nav className="text-xs text-[color:var(--color-subtle-text)]">
          <Link href="/ranking" className="text-[var(--color-primary)] underline-offset-2 hover:underline">
            Regresar al Ranking
          </Link>          
        </nav>

        <h1 className="mt-3 text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
          Cálculo del ranking
        </h1>
             

        

        <h2 className={h2}>Pasos del cálculo (resumen)</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[color:var(--color-subtle-text)] sm:text-base">
          <li>
            <strong className="text-foreground">Promedio por pareja.</strong> Se calcula la media aritmética
            del rating de los dos jugadores del mismo equipo.
          </li>
          <li>
            <strong className="text-foreground">Expectativa.</strong> Con esas dos medias se obtiene la
            probabilidad esperada de victoria de cada equipo.
          </li>
          <li>
            <strong className="text-foreground">Resultado real.</strong> El equipo ganador se trata como
            puntuación 1 y el perdedor como 0.
          </li>
          <li>
            <strong className="text-foreground">Factor K y delta.</strong> Se usa{" "}
            <span className="font-mono text-foreground">K = {ELO_K}</span>. El cambio de cada equipo es
            proporcional a la diferencia entre el resultado real y el esperado, y se{" "}
            <strong className="text-foreground">redondea a entero</strong>
          </li>
          <li>
            <strong className="text-foreground">Mismo delta por jugador del mismo equipo.</strong> Los dos
            jugadores del equipo 1 reciben exactamente el mismo incremento (o decremento); igual para el
            equipo 2.
          </li>
        </ol>

        <h2 className={h2}>Fórmula de la expectativa</h2>
        <p className={p}>
          Para la media del equipo A frente a la media del equipo B, la expectativa de victoria del equipo A
          es:
        </p>
        <pre className={`${mono} mt-3 overflow-x-auto whitespace-pre-wrap`}>
          {`Expectativa_A = 1 / ( 1 + 10^((Rating_B − Rating_A) / 400) )`}
        </pre>
        <p className={p}>
          Donde <span className="font-mono text-foreground">Rating_A</span> y{" "}
          <span className="font-mono text-foreground">Rating_B</span> son las medias de rating de cada equipo. La
          expectativa del equipo B es <span className="font-mono text-foreground">Expectativa_B = 1 − Expectativa_A</span> con
          estas medias (o, equivalentemente, la misma fórmula intercambiando roles).
        </p>

        <h2 className={h2}>Cómo se calculan los deltas</h2>
        <p className={p}>
          Con las expectativas del <strong className="text-foreground">equipo 1</strong> (
          <span className="font-mono text-foreground">Expectativa_1</span>) y del{" "}
          <strong className="text-foreground">equipo 2</strong> (
          <span className="font-mono text-foreground">Expectativa_2</span>), que suman 1, se compara el
          resultado real del partido: el equipo ganador recibe puntuación{" "}
          <span className="font-mono text-foreground">1</span> y el perdedor{" "}
          <span className="font-mono text-foreground">0</span>. El cambio de rating de cada{" "}
          <em className="text-foreground">equipo</em> (y luego de cada jugador de ese equipo) sigue la
          regla estándar de Elo escalada por el factor{" "}
          <span className="font-mono text-foreground">K = {ELO_K}</span>:
        </p>
        <pre className={`${mono} mt-3 overflow-x-auto whitespace-pre-wrap`}>
          {`Delta_1 = redondear( K × (Resultado_1 − Expectativa_1) )
Delta_2 = redondear( K × (Resultado_2 − Expectativa_2) )`}
        </pre>
        <p className={p}>
          <span className="font-mono text-foreground">Resultado</span> es 1 si ese equipo gana el partido
          y 0 si pierde. <strong className="text-foreground">redondear</strong> es el entero más cercano (
          <span className="font-mono text-foreground">Math.round</span> en el código). Los dos jugadores
          del equipo 1 suman exactamente <span className="font-mono text-foreground">Delta_1</span> a su
          ELO cada uno; los dos del equipo 2 suman{" "}
          <span className="font-mono text-foreground">Delta_2</span> cada uno. Si un equipo gana “de
          menos” (resultado 1 pero expectativa baja), el término{" "}
          <span className="font-mono text-foreground">(Resultado − Expectativa)</span> es grande y positivo;
          si pierde “de más” (resultado 0 con expectativa alta), ese término es fuerte y negativo.
        </p>

        <h2 className={h2}>Ejemplo práctico</h2>
        <p className={p}>
          <strong className="text-foreground">equipo 1 (pareja Rojo / Azul):</strong> Jugador Rojo{" "}
          <span className="tabular-nums text-foreground">{rojo}</span>, Jugador Azul{" "}
          <span className="tabular-nums text-foreground">{azul}</span>.
          <br />
          <strong className="text-foreground">equipo 2 (pareja Verde / Amarillo):</strong> Jugador Verde{" "}
          <span className="tabular-nums text-foreground">{verde}</span>, Jugador Amarillo{" "}
          <span className="tabular-nums text-foreground">{amarillo}</span>.
        </p>
        <div className={`${mono} mt-4 space-y-1`}>
          <div>
            Media Equipo 1 = ({rojo} + {azul}) / 2 ={" "}
            <strong className="text-foreground">{equipo1}</strong>
          </div>
          <div>
            Media Equipo 2 = ({verde} + {amarillo}) / 2 ={" "}
            <strong className="text-foreground">{equipo2}</strong>
          </div>
        </div>
        <p className={p}>
          Con esas medias, la expectativa de victoria del equipo 1 (antes de saber quién gana) es
          aproximadamente <strong className="text-foreground">{(exp1vs2 * 100).toFixed(1)}%</strong> y la
          del equipo 2 <strong className="text-foreground">{(exp2vs1 * 100).toFixed(1)}%</strong>. Es decir,
          en papel la pareja Rojo/Azul es favorita porque su media es mayor.
        </p>

        <h3 className={h3}>Si ganan Rojo y Azul (equipo 1)</h3>
        <p className={p}>
          Resultado real: equipo 1 = 1, equipo 2 = 0. Los deltas del código para este caso son: equipo 1{" "}
          <strong className="tabular-nums text-emerald-700 dark:text-emerald-300">
            {ganaequipo1.delta1 > 0 ? "+" : ""}
            {ganaequipo1.delta1}
          </strong>
          , equipo 2{" "}
          <strong className="tabular-nums text-foreground">
            {ganaequipo1.delta2 > 0 ? "+" : ""}
            {ganaequipo1.delta2}
          </strong>
          .
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/80">
                <th className="px-3 py-2 font-semibold">Jugador</th>
                <th className="px-3 py-2 font-semibold">ELO antes</th>
                <th className="px-3 py-2 font-semibold">Cambio</th>
                <th className="px-3 py-2 font-semibold">ELO después</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground/5 bg-surface">
                <td className="px-3 py-2">Jugador Rojo</td>
                <td className="px-3 py-2 tabular-nums">{rojo}</td>
                <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-300">
                  +{ganaequipo1.delta1}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{rojo + ganaequipo1.delta1}</td>
              </tr>
              <tr className="border-b border-foreground/5 bg-muted/20">
                <td className="px-3 py-2">Jugador Azul</td>
                <td className="px-3 py-2 tabular-nums">{azul}</td>
                <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-300">
                  +{ganaequipo1.delta1}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{azul + ganaequipo1.delta1}</td>
              </tr>
              <tr className="border-b border-foreground/5 bg-surface">
                <td className="px-3 py-2">Jugador Verde</td>
                <td className="px-3 py-2 tabular-nums">{verde}</td>
                <td className="px-3 py-2 tabular-nums text-red-700 dark:text-red-300">
                  {ganaequipo1.delta2}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{verde + ganaequipo1.delta2}</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="px-3 py-2">Jugador Amarillo</td>
                <td className="px-3 py-2 tabular-nums">{amarillo}</td>
                <td className="px-3 py-2 tabular-nums text-red-700 dark:text-red-300">
                  {ganaequipo1.delta2}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{amarillo + ganaequipo1.delta2}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={`${p} text-xs sm:text-sm`}>
          Detalle numérico interno: E₁ ≈ {ganaequipo1.expected1.toFixed(4)}, resultado equipo 1 ={" "}
          {ganaequipo1.actual1}, por tanto Δ₁ = round({ELO_K} × ({ganaequipo1.actual1} − {ganaequipo1.expected1.toFixed(4)})) ={" "}
          {ganaequipo1.delta1}.
        </p>

        <h3 className={h3}>Si ganan Verde y Amarillo (equipo 2)</h3>
        <p className={p}>
          Mismas medias ({equipo1} vs {equipo2}), pero ahora el resultado real favorece al equipo 2. Los
          deltas son: equipo 1{" "}
          <strong className="tabular-nums text-foreground">
            {ganaequipo2.delta1 > 0 ? "+" : ""}
            {ganaequipo2.delta1}
          </strong>
          , equipo 2{" "}
          <strong className="tabular-nums text-emerald-700 dark:text-emerald-300">
            {ganaequipo2.delta2 > 0 ? "+" : ""}
            {ganaequipo2.delta2}
          </strong>
          . La sorpresa (vencer siendo inferiores en media) se traduce en un bonus mayor para el equipo 2
          y una penalización mayor para el equipo 1.
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/80">
                <th className="px-3 py-2 font-semibold">Jugador</th>
                <th className="px-3 py-2 font-semibold">ELO antes</th>
                <th className="px-3 py-2 font-semibold">Cambio</th>
                <th className="px-3 py-2 font-semibold">ELO después</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground/5 bg-surface">
                <td className="px-3 py-2">Jugador Rojo</td>
                <td className="px-3 py-2 tabular-nums">{rojo}</td>
                <td className="px-3 py-2 tabular-nums text-red-700 dark:text-red-300">
                  {ganaequipo2.delta1}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{rojo + ganaequipo2.delta1}</td>
              </tr>
              <tr className="border-b border-foreground/5 bg-muted/20">
                <td className="px-3 py-2">Jugador Azul</td>
                <td className="px-3 py-2 tabular-nums">{azul}</td>
                <td className="px-3 py-2 tabular-nums text-red-700 dark:text-red-300">
                  {ganaequipo2.delta1}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{azul + ganaequipo2.delta1}</td>
              </tr>
              <tr className="border-b border-foreground/5 bg-surface">
                <td className="px-3 py-2">Jugador Verde</td>
                <td className="px-3 py-2 tabular-nums">{verde}</td>
                <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-300">
                  +{ganaequipo2.delta2}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{verde + ganaequipo2.delta2}</td>
              </tr>
              <tr className="bg-muted/20">
                <td className="px-3 py-2">Jugador Amarillo</td>
                <td className="px-3 py-2 tabular-nums">{amarillo}</td>
                <td className="px-3 py-2 tabular-nums text-emerald-700 dark:text-emerald-300">
                  +{ganaequipo2.delta2}
                </td>
                <td className="px-3 py-2 tabular-nums font-medium">{amarillo + ganaequipo2.delta2}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={`${p} text-xs sm:text-sm`}>
          Detalle: E₁ ≈ {ganaequipo2.expected1.toFixed(4)}, resultado equipo 1 = {ganaequipo2.actual1}, Δ₁ ={" "}
          {ganaequipo2.delta1}; E₂ ≈ {ganaequipo2.expected2.toFixed(4)}, resultado equipo 2 = {ganaequipo2.actual2},{" "}
          Δ₂ = {ganaequipo2.delta2 > 0 ? "+" : ""}
          {ganaequipo2.delta2}.
        </p>

        <section className={`${card} mt-10`}>
          <h2 className="text-base font-bold uppercase text-primary sm:text-lg">Nota final</h2>
          <p className={p}>
            Este texto describe el comportamiento del software actual. Si en el futuro se cambia el
            factor <span className="font-mono">K</span> o la lógica de equipos, los números del ejemplo
            dejarían de coincidir; la fuente de verdad sigue siendo el código enlazado arriba y las
            tablas de base de datos de partidos y logs de rating.
          </p>
        </section>

        <p className="mt-10 text-center text-sm">
          <Link
            href="/ranking"
            className="font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Volver al ranking
          </Link>
        </p>
      </main>
    </div>
  );
}
