import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createTournamentAction } from "@/app/admin/tournaments/create/actions";

export const metadata: Metadata = {
  title: "Crear torneo",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminCreateTournamentPage({ searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error } = await searchParams;

  return (
    <div className="w-full max-w-4xl rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Admin / Crear torneo</h1>
        <Link
          href="/admin/tournaments"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Volver a torneos
        </Link>
      </div>

      <p className="mb-5 text-sm text-[color:var(--color-subtle-text)]">
        Completa los datos y guarda el torneo en Supabase.
      </p>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <form action={createTournamentAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Nombre *
          </span>
          <input
            name="name"
            required
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            placeholder="Aleph Padel Tournament"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Slug (opcional)
          </span>
          <input
            name="slug"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            placeholder="aleph-padel-tournament"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Formato
          </span>
          <select
            name="format"
            defaultValue="swiss"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="swiss">Swiss</option>
            <option value="american">American</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Estado
          </span>
          <select
            name="status"
            defaultValue="draft"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Ubicacion
          </span>
          <input
            name="location"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            placeholder="Madrid"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Imagen (URL o path)
          </span>
          <input
            name="image"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            placeholder="/torneos/aleph_padel_tournament.png"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Fecha inicio
          </span>
          <input
            name="start_date"
            type="datetime-local"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Fecha fin
          </span>
          <input
            name="end_date"
            type="datetime-local"
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Max teams
          </span>
          <input
            name="max_teams"
            type="number"
            min={1}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Total rounds
          </span>
          <input
            name="total_rounds"
            type="number"
            min={1}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
        </label>

        <label className="sm:col-span-2 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Descripcion
          </span>
          <textarea
            name="description"
            rows={4}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            placeholder="Descripcion del torneo..."
          />
        </label>

        <div className="sm:col-span-2 mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Crear torneo
          </button>
          <Link
            href="/admin/tournaments"
            className="rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
