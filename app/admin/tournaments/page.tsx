import type { Metadata } from "next";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { fetchTournamentsListFromSupabase } from "@/lib/tournaments/supabase-list";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin torneos",
  robots: { index: false, follow: false },
};

/** Shared pixel panel (Sportchain palette) */
const panel =
  "rounded-none border-4 border-[var(--color-primary)] bg-[var(--color-surface)] shadow-[5px_5px_0_var(--color-primary)]";

const headerBtn =
  "flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-none border-4 border-[var(--color-primary)] px-2 py-3 text-center text-[0.5rem] leading-snug uppercase tracking-wide text-[var(--color-primary)] shadow-[4px_4px_0_var(--color-primary)] transition hover:brightness-[1.03] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-primary)] sm:px-3 sm:py-3.5 sm:text-[0.65rem] md:text-xs";

const rowBtn =
  "inline-flex w-full items-center justify-center rounded-none border-4 border-[var(--color-primary)] bg-[var(--color-accent-gold)] px-2 py-2.5 text-center text-[0.5rem] uppercase leading-snug tracking-wide text-[var(--color-primary)] shadow-[3px_3px_0_var(--color-primary)] transition hover:brightness-[1.03] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-primary)] sm:w-auto sm:px-4 sm:text-[0.65rem] md:text-xs";

const statusLabelBase =
  "inline-flex shrink-0 items-center rounded-none border-2 border-[var(--color-primary)] px-2 py-0.5 text-[0.45rem] uppercase leading-none sm:text-[0.5rem]";

function StatusLabel({ status }: { status: "open" | "finished" }) {
  if (status === "open") {
    return (
      <span className={`${statusLabelBase} bg-[var(--color-accent-gold)]/45 text-[var(--color-primary)]`}>
        Open
      </span>
    );
  }
  return (
    <span className={`${statusLabelBase} bg-[var(--color-muted)] text-[var(--color-subtle-text)]`}>
      Finished
    </span>
  );
}

export default async function AdminTournamentsPage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const result = await fetchTournamentsListFromSupabase();
  const tournaments = [...result.upcoming, ...result.past].sort((a, b) => {
    if (!a.dateISO && !b.dateISO) return 0;
    if (!a.dateISO) return 1;
    if (!b.dateISO) return -1;
    return b.dateISO.localeCompare(a.dateISO);
  });

  return (
    <div className="flex w-full min-w-0 flex-col">
      <AdminNavbar />

      <div
        className={`mx-auto w-full min-w-0 max-w-4xl px-3 pb-10 pt-3 sm:px-4 sm:pb-12 sm:pt-4 ${pixel.className}`}
      >
        {/* Title + actions: stacked on narrow phones, row of actions matches admin home */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-row gap-2 sm:gap-3">
          <h1 className="">Torneos</h1>          
            <Link
              href="/admin/tournaments/create"
              className={`${headerBtn} bg-[var(--color-accent-gold)]`}
            >
              Nuevo Torneo
            </Link>
            
          </div>
        </div>

        {!result.ok ? (
          <p
            className={`${panel} mb-4 border-amber-700 bg-amber-950/30 px-3 py-3 text-[0.55rem] leading-relaxed text-amber-100 sm:text-[0.65rem]`}
          >
            {result.error}
          </p>
        ) : null}

        {/* Mobile: stacked pixel cards */}
        <ul className="mb-0 flex list-none flex-col gap-3 md:hidden" role="list">
          {tournaments.length === 0 ? (
            <li className={`${panel} px-3 py-4 text-center text-[0.55rem] leading-relaxed text-[var(--color-subtle-text)]`}>
              No hay torneos.
            </li>
          ) : (
            tournaments.map((t) => (
              <li key={t.id}>
                <article className={`${panel} flex flex-col gap-2 p-3 sm:p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b-4 border-[var(--color-primary)]/25 pb-2">
                    <h2 className="min-w-0 flex-1 break-words text-[0.55rem] font-normal uppercase leading-snug text-[var(--color-primary)] sm:text-[0.6rem]">
                      {t.name}
                    </h2>
                    <StatusLabel status={t.adminStatus ?? "open"} />
                  </div>
                  <p className="text-[0.5rem] leading-relaxed text-[var(--color-subtle-text)] sm:text-[0.55rem]">
                    {t.dateLabel}
                  </p>
                  <Link href={`/admin/tournaments/${t.slug}`} className={rowBtn}>
                    Ver
                  </Link>
                </article>
              </li>
            ))
          )}
        </ul>

        {/* md+: compact table, horizontal scroll only if needed */}
        <div className={`hidden min-w-0 overflow-x-auto md:block ${panel}`}>
          <table className="w-full min-w-[min(100%,520px)] border-collapse text-left">
            <thead>
              <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-muted)]">
                <th className="px-3 py-2.5 text-[0.55rem] font-normal uppercase text-[var(--color-primary)] sm:px-4 sm:text-[0.65rem] md:text-xs">
                  Nombre
                </th>
                <th className="px-3 py-2.5 text-[0.55rem] font-normal uppercase text-[var(--color-primary)] sm:px-4 sm:text-[0.65rem] md:text-xs">
                  Fecha
                </th>
                <th className="px-3 py-2.5 text-[0.55rem] font-normal uppercase text-[var(--color-primary)] sm:px-4 sm:text-[0.65rem] md:text-xs">
                  Estado
                </th>
                <th className="w-28 px-3 py-2.5 text-[0.55rem] font-normal uppercase text-[var(--color-primary)] sm:px-4 sm:text-[0.65rem] md:text-xs">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-[0.55rem] text-[var(--color-subtle-text)] sm:text-[0.65rem]"
                  >
                    No hay torneos.
                  </td>
                </tr>
              ) : (
                tournaments.map((t) => (
                  <tr key={t.id} className="border-t-4 border-[var(--color-primary)]/15 first:border-t-0">
                    <td className="max-w-[min(100%,14rem)] break-words px-3 py-2.5 text-[0.55rem] text-[var(--color-primary)] sm:max-w-none sm:px-4 sm:text-[0.65rem] md:text-xs">
                      {t.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[0.55rem] text-[var(--color-subtle-text)] sm:px-4 sm:text-[0.65rem] md:text-xs">
                      {t.dateLabel}
                    </td>
                    <td className="px-3 py-2.5 align-middle sm:px-4">
                      <StatusLabel status={t.adminStatus ?? "open"} />
                    </td>
                    <td className="px-3 py-2 sm:px-4">
                      <Link href={`/admin/tournaments/${t.slug}`} className={rowBtn}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
