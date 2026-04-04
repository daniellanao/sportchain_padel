import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminPlayersTable } from "@/components/admin/AdminPlayersTable";
import { fetchPlayersListFromSupabase } from "@/lib/ranking/supabase-players";

export const metadata: Metadata = {
  title: "Admin jugadores",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminPlayersPage({ searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error, success } = await searchParams;
  const playersResult = await fetchPlayersListFromSupabase();
  const players = playersResult.players.map((p) => ({
    id: p.id,
    name: p.name,
    lastname: p.lastname,
    email: p.email,
    createdAt: p.created_at,
  }));

  return (
    <div className="flex w-full min-w-0 flex-col">
      <AdminNavbar />

      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-12 pt-4 sm:px-6">
        <div className="rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
          <div className="mb-6">
            <h1 className="logo text-xl text-primary">Jugadores</h1>
          </div>

          {error ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}
          {!playersResult.ok ? (
            <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {playersResult.error}
            </p>
          ) : null}

          <AdminPlayersTable players={players} />
        </div>
      </div>
    </div>
  );
}
