import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminOpenTournamentsTable } from "@/components/admin/AdminOpenTournamentsTable";
import { fetchOrganizersListFromSupabase } from "@/lib/organizers/supabase-organizers";
import { fetchOpenTournamentsListFromSupabase } from "@/lib/open-tournaments/supabase-open-tournaments";
import { fetchVenuesListFromSupabase } from "@/lib/venues/supabase-venues";

export const metadata: Metadata = {
  title: "Admin torneos abiertos",
  robots: { index: false, follow: false },
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

const cardClass = "rounded-xl border border-foreground/10 bg-surface shadow-sm";

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminOpenTournamentsPage({ searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error, success } = await searchParams;
  const [listResult, orgResult, venuesResult] = await Promise.all([
    fetchOpenTournamentsListFromSupabase(),
    fetchOrganizersListFromSupabase(),
    fetchVenuesListFromSupabase(),
  ]);

  const orgById = new Map(orgResult.organizers.map((o) => [o.id, o.name]));
  const venueById = new Map(venuesResult.venues.map((v) => [v.id, v.name]));

  const rows = listResult.rows.map((r) => ({
    id: r.id,
    name: r.name,
    organizerId: r.organizer_id,
    organizerName: orgById.get(r.organizer_id) ?? `#${r.organizer_id}`,
    slug: r.slug,
    venueId: r.venue_id,
    venueName:
      r.venue_id != null ? (venueById.get(r.venue_id) ?? `#${r.venue_id}`) : null,
    startDate: r.start_date,
    endDate: r.end_date,
    format: r.format,
    category: r.category,
    createdAt: r.created_at,
  }));

  const organizers = orgResult.organizers.map((o) => ({ id: o.id, name: o.name }));
  const venues = venuesResult.venues.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <h1 className="logo text-2xl text-primary sm:text-3xl">Torneos abiertos</h1>
          <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/admin" className={adminCtaClass}>
              Inicio
            </Link>
          </div>
        </div>

        <section className={`${cardClass} p-4 sm:p-6`}>
          {error ? (
            <p
              className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              {success}
            </p>
          ) : null}
          {!listResult.ok ? (
            <p
              className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
              role="alert"
            >
              {listResult.error}
            </p>
          ) : null}
          {!orgResult.ok ? (
            <p
              className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
              role="alert"
            >
              {orgResult.error}
            </p>
          ) : null}
          {!venuesResult.ok ? (
            <p
              className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
              role="alert"
            >
              {venuesResult.error}
            </p>
          ) : null}

          <AdminOpenTournamentsTable rows={rows} organizers={organizers} venues={venues} />
        </section>
      </main>
    </div>
  );
}
