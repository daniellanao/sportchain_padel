import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { fetchTournamentsListFromSupabase } from "@/lib/tournaments/supabase-list";

export const metadata: Metadata = {
  title: "Admin torneos",
  robots: { index: false, follow: false },
};

export default async function AdminTournamentsPage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const result = await fetchTournamentsListFromSupabase();
  const tournaments = [...result.upcoming, ...result.past].sort((a, b) => {
    if (!a.dateISO && !b.dateISO) return 0;
    if (!a.dateISO) return 1;
    if (!b.dateISO) return -1;
    return a.dateISO.localeCompare(b.dateISO);
  });

  return (
    <div className="w-full max-w-4xl rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Admin / Torneos</h1>
        <Link href="/admin" className="text-sm text-primary underline-offset-4 hover:underline">
          Volver al panel
        </Link>
      </div>

      {!result.ok ? (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {result.error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-foreground/10">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead className="bg-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-2 font-semibold text-foreground">Nombre</th>
              <th className="px-4 py-2 font-semibold text-foreground">Fecha</th>
              <th className="px-4 py-2 font-semibold text-foreground">Accion</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-[color:var(--color-subtle-text)]">
                  No hay torneos.
                </td>
              </tr>
            ) : (
              tournaments.map((t) => (
                <tr key={t.id} className="border-t border-foreground/10">
                  <td className="px-4 py-2">{t.name}</td>
                  <td className="px-4 py-2">{t.dateLabel}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/tournaments/${t.slug}`}
                      className="inline-block rounded border border-foreground/20 bg-background px-2 py-1 text-xs font-medium transition hover:bg-muted"
                    >
                      Show
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
