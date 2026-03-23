import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { RANKING_PLAYERS } from "@/data/ranking";

const description =
  "Live-style ELO leaderboard for padel players: rank, matches played, and rating points. Track who’s on top at your club.";

export const metadata: Metadata = {
  title: "Player ranking",
  description,
  openGraph: {
    title: "Player ranking",
    description,
    url: "/ranking",
  },
  alternates: {
    canonical: "/ranking",
  },
};

export default function RankingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-black uppercase text-[var(--color-primary)] sm:text-3xl">
            Ranking
          </h1>   
        <div className="overflow-x-auto border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
                <th className="navbar-text px-3 py-3 text-xs uppercase sm:px-4">#</th>
                <th className="navbar-text px-3 py-3 text-xs uppercase sm:px-4">Name</th>
                <th className="navbar-text px-3 py-3 text-xs uppercase sm:px-4">Last name</th>
                <th className="navbar-text px-3 py-3 text-xs uppercase sm:px-4">Matches</th>
                <th className="navbar-text px-3 py-3 text-xs uppercase sm:px-4">Points</th>
                <th className="navbar-text px-3 py-3 text-xs uppercase sm:px-4">Detail</th>
              </tr>
            </thead>
            <tbody>
              {RANKING_PLAYERS.map((player, index) => (
                <tr
                  key={player.id}
                  className={
                    index % 2 === 0
                      ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                      : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                  }
                >
                  <td className="px-3 py-3 font-mono text-[var(--color-primary)] sm:px-4">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3 font-medium text-[var(--color-foreground)] sm:px-4">
                    {player.firstName}
                  </td>
                  <td className="px-3 py-3 font-medium text-[var(--color-foreground)] sm:px-4">
                    {player.lastName}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-[var(--color-subtle-text)] sm:px-4">
                    {player.matchesPlayed}
                  </td>
                  <td className="navbar-text px-3 py-3 tabular-nums text-[var(--color-primary)] sm:px-4">
                    {player.points}
                  </td>
                  <td className="px-2 py-2 sm:px-3">
                    <Link
                      href={`/ranking/${player.id}`}
                      className="navbar-text btn-gold inline-flex min-h-[36px] items-center justify-center whitespace-nowrap border-2 border-[var(--color-accent-gold)] px-3 py-1.5 text-[10px] uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:brightness-105 sm:text-xs"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
