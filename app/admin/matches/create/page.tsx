import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createStandaloneRatingMatchAction } from "@/app/admin/matches/create/actions";
import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminCreateMatchPlayerSlots } from "@/components/admin/AdminCreateMatchPlayerSlots";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nuevo partido (rating)",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

export default async function AdminCreateRatingMatchPage({ searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error: uiError, success } = await searchParams;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AdminNavbar />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Falta configuración de Supabase.
          </p>
        </main>
      </div>
    );
  }

  const slots: Array<{ side: number; role: number; name: string }> = [
    { side: 1, role: 1, name: "player_s1_r1" },
    { side: 1, role: 2, name: "player_s1_r2" },
    { side: 2, role: 1, name: "player_s2_r1" },
    { side: 2, role: 2, name: "player_s2_r2" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="logo text-xl text-primary sm:text-2xl">Nuevo partido (rating)</h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/matches" className={adminCtaClass}>
              Lista partidos
            </Link>
            <Link href="/admin" className={adminCtaClass}>
              Inicio
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
          {uiError ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200">
              {uiError}
            </p>
          ) : null}
          {success ? (
            <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
              {success}
            </p>
          ) : null}

          <p className="mb-6 text-sm text-[color:var(--color-subtle-text)]">
            Partido informal (sin torneo ni partido fuente). Elige las dos parejas, el ganador y, si
            quieres, aplica el Elo al guardar (misma regla que en el detalle: K=32, promedio por lado).
            Los jugadores se buscan por API (sin cargar miles de filas): escribe al menos dos caracteres;
            los resultados salen ordenados por apellido y nombre, con el ELO visible.
          </p>

          <form action={createStandaloneRatingMatchAction} className="space-y-6">
            <label className="flex max-w-md flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">Fecha y hora del partido</span>
              <span className="text-xs text-[color:var(--color-subtle-text)]">
                Vacío = ahora. Se guarda en UTC según tu zona al elegir la fecha.
              </span>
              <input
                type="datetime-local"
                name="playedAt"
                className="mt-1 rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
              />
            </label>

            <label className="flex max-w-xs flex-col gap-1 text-sm">
              <span className="font-medium text-foreground">Equipo ganador</span>
              <span className="text-xs text-[color:var(--color-subtle-text)]">
                Los dos jugadores de ese lado recibirán <span className="font-mono">is_winner</span>.
              </span>
              <select
                name="winnerSide"
                defaultValue="1"
                className="mt-1 rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
              >
                <option value="1">Lado 1</option>
                <option value="2">Lado 2</option>
              </select>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="applyElo"
                value="1"
                defaultChecked
                className="mt-1 h-4 w-4 rounded border-foreground/20 text-primary"
              />
              <span>
                <span className="font-medium text-foreground">Aplicar Elo al crear</span>
                <span className="mt-0.5 block text-xs text-[color:var(--color-subtle-text)]">
                  Si está marcado, se crean <span className="font-mono">rating_logs</span> y se
                  actualizan ratings de los cuatro jugadores. Desmárcalo para revisar el partido en el
                  detalle antes de procesar.
                </span>
              </span>
            </label>

            <div className="overflow-x-auto rounded-lg border border-foreground/10">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10 bg-[var(--color-muted)]">
                    <th className="px-3 py-2 font-semibold">Lado</th>
                    <th className="px-3 py-2 font-semibold">Rol</th>
                    <th className="px-3 py-2 font-semibold">Jugador</th>
                  </tr>
                </thead>
                <tbody>
                  <AdminCreateMatchPlayerSlots slots={slots} />
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Crear partido
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
