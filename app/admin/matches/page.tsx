import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminRatingMatchesTable } from "@/components/admin/AdminRatingMatchesTable";
import { fetchRatingMatchesListFromSupabase } from "@/lib/rating/supabase-rating-matches-list";

export const metadata: Metadata = {
  title: "Admin partidos (rating)",
  robots: { index: false, follow: false },
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

const cardClass = "rounded-xl border border-foreground/10 bg-surface shadow-sm";

export default async function AdminMatchesPage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const listResult = await fetchRatingMatchesListFromSupabase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <h1 className="logo text-2xl text-primary sm:text-3xl">Partidos (rating)</h1>
          <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/admin" className={adminCtaClass}>
              Inicio
            </Link>
            <Link href="/admin/matches/create" className={adminCtaClass}>
              Nuevo partido
            </Link>
          </div>
        </div>

        <section className={`${cardClass} p-4 sm:p-6`}>
          {!listResult.ok ? (
            <p
              className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
              role="alert"
            >
              {listResult.error}
            </p>
          ) : null}

          <p className="mb-4 text-xs text-[color:var(--color-subtle-text)]">
            Orden: más reciente primero. Clic en el id para abrir el detalle del partido.
          </p>

          <AdminRatingMatchesTable matches={listResult.matches} />
        </section>
      </main>
    </div>
  );
}
