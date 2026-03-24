import type { Metadata } from "next";
import { faTrophy, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { redirect } from "next/navigation";

import { adminLogoutAction, isAdminSessionValid } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Panel",
};

export default async function AdminHomePage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  return (
    <div className="w-full max-w-sm border-4 border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-[8px_8px_0_rgba(0,0,0,0.25)] sm:max-w-md sm:p-6">
      <h1 className="logo mb-1 text-center text-2xl uppercase tracking-wide text-[var(--color-primary)]">
        Admin
      </h1>
      <p className="mb-5 text-center text-xs uppercase tracking-[0.12em] text-[color:var(--color-subtle-text)]">
        Panel mobile
      </p>

      <div className="grid grid-cols-1 gap-3">
        <Link
          href="/admin/tournaments"
          className="group border-4 border-[var(--color-primary)] bg-[var(--color-muted)] px-4 py-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-gold)]/20"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center border-2 border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary)]">
              <FontAwesomeIcon icon={faTrophy} className="h-4 w-4" />
            </span>
            <span className="navbar-text text-sm uppercase text-[var(--color-primary)]">Torneos</span>
          </span>
        </Link>

        <Link
          href="/admin/players"
          className="group border-4 border-[var(--color-primary)] bg-[var(--color-muted)] px-4 py-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-gold)]/20"
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center border-2 border-[var(--color-primary)] bg-[var(--color-surface)] text-[var(--color-primary)]">
              <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
            </span>
            <span className="navbar-text text-sm uppercase text-[var(--color-primary)]">Jugadores</span>
          </span>
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="navbar-text w-full border-2 border-[var(--color-primary)] bg-background px-4 py-2 text-xs uppercase text-[var(--color-primary)] transition hover:bg-[var(--color-muted)]"
          >
            Cerrar sesion
          </button>
        </form>
        <Link
          href="/"
          className="navbar-text block border-2 border-[var(--color-primary)] bg-background px-4 py-2 text-center text-xs uppercase text-[var(--color-primary)] transition hover:bg-[var(--color-muted)]"
        >
          Volver al sitio
        </Link>
      </div>
    </div>
  );
}
