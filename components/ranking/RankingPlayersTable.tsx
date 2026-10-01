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
          className="w-full rounded-lg border border-black/15 bg-[var(--color-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-foreground)] outline-none transition placeholder:text-[var(--color-subtle-text)] focus:border-black focus:ring-1 focus:ring-black"
        />
      </div>

      {trimmedQuery ? (
        <p className="text-xs text-[color:var(--color-subtle-text)]">
          Mostrando{" "}
          <span className="font-medium tabular-nums text-[var(--color-foreground)]">{filtered.length}</span> de{" "}
          <span className="font-medium tabular-nums text-[var(--color-foreground)]">{rankedPlayers.length}</span>
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-black/10 shadow-sm">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="bg-black text-white">
              <th className="w-[12%] px-2 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:w-[10%] sm:px-3">
                Pos
              </th>
              <th className="w-[40%] px-2 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-3">
                Jugador
              </th>
              <th
                className="w-[14%] px-2 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-3"
                title="Partidos jugados"
              >
                PJ
              </th>
              <th
                className="w-[16%] px-2 py-2.5 text-center text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-3"
                title="Puntos ELO"
              >
                ELO
              </th>
              <th
                className="w-[18%] px-2 py-2.5 text-right text-[0.6875rem] font-bold uppercase tracking-[0.12em] sm:px-3"
                title="Detalle del jugador"
              >
                <span className="sr-only">Detalle</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rankedPlayers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="bg-[var(--color-surface)] px-3 py-6 text-center text-sm text-[var(--color-subtle-text)]"
                >
                  No hay jugadores en el ranking todavía.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="bg-[var(--color-surface)] px-3 py-6 text-center text-sm text-[var(--color-subtle-text)]"
                >
                  Ningún jugador coincide con &ldquo;{trimmedQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map(({ player, position }) => (
                <tr
                  key={player.id}
                  className="border-t border-black/5 bg-[var(--color-surface)] transition-colors even:bg-[var(--color-muted)]/50 hover:bg-[var(--color-muted)]"
                >
                  <td className="px-2 py-2 text-center sm:px-3">
                    {position === 1 ? (
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#E3C273] text-sm font-extrabold tabular-nums text-black"
                        title="Líder del ranking"
                      >
                        1
                      </span>
                    ) : (
                      <span
                        className={`tabular-nums ${
                          position <= 3
                            ? "text-base font-extrabold text-black"
                            : "font-semibold text-[var(--color-subtle-text)]"
                        }`}
                      >
                        {position}
                      </span>
                    )}
                  </td>
                  <td className="truncate px-2 py-2 font-semibold text-black sm:px-3">
                    {player.name} {player.lastname}
                    {player.stars != null && player.stars > 0 ? (
                      <span
                        className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-[var(--color-muted)] px-1.5 py-0.5 align-middle text-[0.625rem] font-bold tabular-nums text-black"
                        title={player.stars === 1 ? "1 Torneo ganado" : `${player.stars} Torneos ganados`}
                      >
                        <FontAwesomeIcon icon={faStar} className="h-2.5 w-2.5 text-[#B8963F]" aria-hidden />
                        {player.stars}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums text-[var(--color-subtle-text)] sm:px-3">
                    {player.matches_played}
                  </td>
                  <td className="px-2 py-2 text-center text-base font-extrabold tabular-nums text-black sm:px-3">
                    {player.rating}
                  </td>
                  <td className="px-2 py-1.5 text-right sm:px-3">
                    <Link
                      href={`/ranking/${player.id}`}
                      className="inline-flex items-center rounded-md border border-black/25 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-black transition hover:border-black hover:bg-black hover:text-white"
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
