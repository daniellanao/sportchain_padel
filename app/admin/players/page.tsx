import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { createPlayerAction, updatePlayerAction } from "@/app/admin/players/actions";
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
  const players = playersResult.players;

  return (
    <div className="w-full max-w-5xl rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="logo text-xl text-primary">Admin / Players</h1>
        <Link href="/admin" className="text-sm text-primary underline-offset-4 hover:underline">
          Volver al panel
        </Link>
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

      <section className="mb-8 rounded-lg border border-foreground/10 p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Create player
        </h2>
        <form action={createPlayerAction} className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              name="name"
              required
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lastname
            <input
              name="lastname"
              required
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              name="email"
              type="email"
              className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Edit players
        </h2>
        {players.length === 0 ? (
          <p className="text-sm text-[color:var(--color-subtle-text)]">No players found.</p>
        ) : (
          <ul className="space-y-3">
            {players.map((player) => (
              <li key={player.id} className="rounded-lg border border-foreground/10 p-4">
                <form action={updatePlayerAction} className="grid gap-3 sm:grid-cols-4">
                  <input type="hidden" name="id" value={player.id} />
                  <label className="flex flex-col gap-1 text-sm">
                    Name
                    <input
                      name="name"
                      required
                      defaultValue={player.name}
                      className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    Lastname
                    <input
                      name="lastname"
                      required
                      defaultValue={player.lastname}
                      className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    Email
                    <input
                      name="email"
                      type="email"
                      defaultValue={player.email ?? ""}
                      className="rounded-lg border border-foreground/15 bg-background px-3 py-2 text-foreground outline-none ring-primary/40 focus:ring-2"
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
