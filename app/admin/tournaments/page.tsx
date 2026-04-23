import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { fetchTournamentsListFromSupabase } from "@/lib/tournaments/supabase-list";

export const metadata: Metadata = {
  title: "Admin torneos",
  robots: { index: false, follow: false },
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

const rowLinkClass =
  "navbar-text btn-gold inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-3 py-2 text-xs uppercase shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:opacity-95 active:brightness-95";

const cardClass =
  "rounded-xl border border-foreground/10 bg-surface shadow-sm";

const statusLabelBase =
  "inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-wide";

function StatusLabel({ status }: { status: "open" | "finished" }) {
  if (status === "open") {
    return (
      <span
        className={`${statusLabelBase} border-emerald-600/40 bg-emerald-500/10 text-emerald-900 dark:border-emerald-400/45 dark:bg-emerald-400/10 dark:text-emerald-200`}
      >
        Open
      </span>
    );
  }
  return (
    <span
      className={`${statusLabelBase} border-foreground/20 bg-muted text-[color:var(--color-subtle-text)]`}
    >
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
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <h1 className="logo text-2xl text-primary sm:text-3xl">Torneos</h1>
          <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/admin/tournaments/create" className={adminCtaClass}>
              Nuevo
            </Link>
            <Link href="/admin" className={adminCtaClass}>
              Inicio
            </Link>
          </div>
        </div>

        {!result.ok ? (
          <p
            className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
            role="alert"
          >
            {result.error}
          </p>
        ) : null}

        <ul className="mb-0 flex list-none flex-col gap-3 md:hidden" role="list">
          {tournaments.length === 0 ? (
            <li className={`${cardClass} px-4 py-6 text-center text-sm text-[color:var(--color-subtle-text)]`}>
              No hay torneos.
            </li>
          ) : (
            tournaments.map((t) => (
              <li key={t.id}>
                <article className={`${cardClass} flex flex-col gap-3 p-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-foreground/10 pb-3">
                    <h2 className="min-w-0 flex-1 break-words text-base font-semibold leading-snug text-primary">
                      {t.name}
                    </h2>
                    <StatusLabel status={t.adminStatus ?? "open"} />
                  </div>
                  <p className="text-sm leading-relaxed text-[color:var(--color-subtle-text)]">{t.dateLabel}</p>
                  <Link href={`/admin/tournaments/${t.slug}`} className={`${rowLinkClass} w-full sm:w-auto`}>
                    Ver
                  </Link>
                </article>
              </li>
            ))
          )}
        </ul>

        <div className={`hidden min-w-0 overflow-x-auto text-left md:block ${cardClass}`}>
          <table className="w-full min-w-[min(100%,520px)] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-foreground/15 bg-muted">
                <th className="px-4 py-3 font-semibold text-primary">Nombre</th>
                <th className="px-4 py-3 font-semibold text-primary">Fecha</th>
                <th className="px-4 py-3 font-semibold text-primary">Estado</th>
                <th className="w-32 px-4 py-3 font-semibold text-primary">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-[color:var(--color-subtle-text)]">
                    No hay torneos.
                  </td>
                </tr>
              ) : (
                tournaments.map((t) => (
                  <tr key={t.id} className="border-t border-foreground/10 first:border-t-0">
                    <td className="max-w-[min(100%,14rem)] break-words px-4 py-3 text-foreground sm:max-w-none">
                      {t.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-subtle-text)]">
                      {t.dateLabel}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <StatusLabel status={t.adminStatus ?? "open"} />
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/admin/tournaments/${t.slug}`} className={rowLinkClass}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
