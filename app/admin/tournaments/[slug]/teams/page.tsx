import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { TournamentTeamsPanel, type TeamListRow } from "@/components/admin/TournamentTeamsPanel";
import type { PlayerDbRow } from "@/lib/ranking/supabase-players";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TournamentDbRow } from "@/lib/tournaments/supabase-list";

export const metadata: Metadata = {
  title: "Admin equipos",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminTournamentTeamsPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { slug } = await params;
  const { error: uiError, success } = await searchParams;

  const supabase = createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: tournamentData, error: tournamentError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (tournamentError || !tournamentData) notFound();
  const tournament = tournamentData as TournamentDbRow;

  const { data: relationRows } = await supabase
    .from("player_tournament")
    .select("player_id")
    .eq("tournament_id", tournament.id);
  const tournamentPlayerIds = new Set(
    (relationRows ?? []).map((r) => Number((r as { player_id: number }).player_id))
  );

  const { data: playersRows } = await supabase
    .from("players")
    .select("id, name, lastname, rating")
    .order("rating", { ascending: false });
  const allPlayers = ((playersRows ?? []) as Array<
    Pick<PlayerDbRow, "id" | "name" | "lastname" | "rating">
  >).filter((p) => tournamentPlayerIds.has(p.id));

  const { data: teamsRows } = await supabase
    .from("teams")
    .select("id, player1_id, player2_id, team_name")
    .eq("tournament_id", tournament.id)
    .order("id", { ascending: true });
  const teams = (teamsRows ?? []) as TeamListRow[];

  return (
    <div className="flex w-full min-w-0 flex-col">
      <AdminNavbar />

      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-12 pt-4 sm:px-6">
        <div className="rounded-xl border border-foreground/10 bg-surface p-6 shadow-lg sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="logo text-xl text-primary">Equipos</h1>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/tournaments/${slug}`} className="text-primary underline-offset-4 hover:underline">
                Volver al torneo
              </Link>
              <Link href="/admin/tournaments" className="text-primary underline-offset-4 hover:underline">
                Volver a torneos
              </Link>
            </div>
          </div>

          <p className="mb-4 text-sm text-[color:var(--color-subtle-text)]">{tournament.name}</p>

          {uiError ? (
            <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {uiError}
            </p>
          ) : null}
          {success ? (
            <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}

          <TournamentTeamsPanel slug={slug} tournamentId={tournament.id} players={allPlayers} teams={teams} />
        </div>
      </div>
    </div>
  );
}
