"use client";

import { faMagnifyingGlass, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { PlayerDbRow } from "@/lib/ranking/supabase-players";

export type RankedPlayerRow = {
  player: PlayerDbRow;
  index: number;
  position: number;
};

type RankingPlayersTableProps = {
  rankedPlayers: RankedPlayerRow[];
};

function playerMatchesQuery(player: PlayerDbRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fullName = `${player.name} ${player.lastname}`.toLowerCase();
  return (
    fullName.includes(q) ||
    player.name.toLowerCase().includes(q) ||
    player.lastname.toLowerCase().includes(q)
  );
}

export function RankingPlayersTable({ rankedPlayers }: RankingPlayersTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => rankedPlayers.filter(({ player }) => playerMatchesQuery(player, query)),
    [rankedPlayers, query],
  );

  const trimmedQuery = query.trim();

  return (
    <div className="mt-6 space-y-3">
      <div className="relative max-w-md">
        <label htmlFor="ranking-players-search" className="sr-only">
          Buscar jugadores por nombre o apellido
        </label>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-subtle-text)]"
          aria-hidden
        />
        <input
          id="ranking-players-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o apellido…"
          autoComplete="off"
          className="navbar-text w-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-xs text-[var(--color-foreground)] shadow-[2px_2px_0_rgba(0,0,0,0.15)] outline-none transition placeholder:text-[var(--color-subtle-text)] focus:border-[var(--color-accent-gold)] sm:text-sm"
        />
      </div>

      {trimmedQuery ? (
        <p className="text-xs text-[color:var(--color-subtle-text)]">
          Mostrando{" "}
          <span className="font-medium tabular-nums text-[var(--color-foreground)]">{filtered.length}</span> de{" "}
          <span className="font-medium tabular-nums text-[var(--color-foreground)]">{rankedPlayers.length}</span>
        </p>
      ) : null}

      <div className="overflow-hidden border-4 border-[var(--color-primary)] shadow-[6px_6px_0_rgba(0,0,0,0.2)]">
        <table className="w-full table-fixed border-collapse text-left text-xs leading-tight">
          <thead>
            <tr className="border-b-4 border-[var(--color-primary)] bg-[var(--color-primary)] text-white">
              <th className="navbar-text w-[10%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5">
                #
              </th>
              <th className="navbar-text w-[40%] px-2 py-1.5 text-[10px] uppercase sm:px-2.5">
                Nombre
              </th>
              <th
                className="navbar-text w-[10%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5"
                title="Partidos jugados"
              >
                Part.
              </th>
              <th
                className="navbar-text w-[20%] px-2 py-1.5 text-center text-[10px] uppercase sm:px-2.5"
                title="Puntos ELO"
              >
                ELO
              </th>
              <th
                className="navbar-text w-[20%] whitespace-nowrap px-2 py-1.5 text-[10px] uppercase sm:px-2.5"
                title="Detalle del jugador"
              >
                Det.
              </th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border-b border-[var(--color-muted)] bg-[var(--color-surface)] px-3 py-4 text-center text-xs text-[var(--color-subtle-text)] sm:px-4"
                >
                  No hay jugadores en el ranking todavía.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border-b border-[var(--color-muted)] bg-[var(--color-surface)] px-3 py-4 text-center text-xs text-[var(--color-subtle-text)] sm:px-4"
                >
                  Ningún jugador coincide con &ldquo;{trimmedQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map(({ player, index, position }) => (
                <tr
                  key={player.id}
                  className={
                    index % 2 === 0
                      ? "border-b border-[var(--color-muted)] bg-[var(--color-muted)]/60"
                      : "border-b border-[var(--color-muted)] bg-[var(--color-surface)]"
                  }
                >
                  <td className="w-[10%] px-2 py-1.5 text-center font-mono tabular-nums text-[var(--color-primary)] sm:px-2.5">
                    {position}
                  </td>
                  <td className="w-[40%] truncate px-2 py-1.5 font-medium text-[var(--color-foreground)] sm:px-2.5">
                    {player.name} {player.lastname}
                    {player.stars != null && player.stars > 0 ? (
                      <span className="ml-1 inline-flex translate-y-[1px] items-center align-middle">
                        <span className="relative inline-flex h-4 w-4 items-center justify-center text-[var(--color-primary)]">
                          <FontAwesomeIcon icon={faStar} className="h-4 w-4" aria-hidden />
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none text-white">
                            {player.stars}
                          </span>
                        </span>
                      </span>
                    ) : null}
                  </td>
                  <td className="w-[10%] px-2 py-1.5 text-center tabular-nums text-[var(--color-subtle-text)] sm:px-2.5">
                    {player.matches_played}
                  </td>
                  <td className="navbar-text w-[20%] px-2 py-1.5 text-center tabular-nums text-[var(--color-primary)] sm:px-2.5">
                    {player.rating}
                  </td>
                  <td className="w-[20%] px-1.5 py-1 sm:px-2">
                    <Link
                      href={`/ranking/${player.id}`}
                      className="navbar-text btn-gold inline-flex min-h-[26px] items-center justify-center whitespace-nowrap border-2 border-[var(--color-accent-gold)] px-2 py-0.5 text-[9px] uppercase leading-none shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:brightness-105 sm:text-[10px]"
                    >
                      Ver
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
