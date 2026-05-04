import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export const metadata: Metadata = {
  title: "Panel",
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[200px]";

export default async function AdminHomePage() {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-12">
        <h1 className="logo mb-2 text-2xl text-primary sm:text-3xl">ADMIN</h1>

        <div className="mx-auto mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link href="/admin/tournaments" className={adminCtaClass}>
            Torneos
          </Link>
          <Link href="/admin/players" className={adminCtaClass}>
            Jugadores
          </Link>
          <Link href="/admin/matches" className={adminCtaClass}>
            Partidos
          </Link>
        </div>
      </main>
    </div>
  );
}
