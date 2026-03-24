"use client";

import { faCheck, faPen, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export type ControlTeamOption = {
  id: number;
  name: string;
};

export type ControlMatchRow = {
  id: number;
  team1Id: number | null;
  team2Id: number | null;
  winnerTeamId: number | null;
  team1Games: number;
  team2Games: number;
  finished: boolean;
};

type MatchesControlTableProps = {
  roundNumber: number;
  slug: string;
  teams: ControlTeamOption[];
  matches: ControlMatchRow[];
  updateAction: (formData: FormData) => Promise<void>;
};

export function MatchesControlTable({
  roundNumber,
  slug,
  teams,
  matches,
  updateAction,
}: MatchesControlTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingMatch = matches.find((m) => m.id === editingId) ?? null;

  const getTeamName = (id: number | null) => {
    if (id == null) return "—";
    return teams.find((t) => t.id === id)?.name ?? `Team #${id}`;
  };

  const isWinner = (match: ControlMatchRow, teamId: number | null): boolean => {
    if (teamId == null) return false;
    return match.winnerTeamId === teamId;
  };

  const isLoser = (match: ControlMatchRow, teamId: number | null): boolean => {
    if (teamId == null || match.winnerTeamId == null) return false;
    return match.winnerTeamId !== teamId;
  };

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
        Ronda {roundNumber}
      </h2>
      {matches.length === 0 ? (
        <p className="text-sm text-[color:var(--color-subtle-text)]">Sin partidos en esta ronda.</p>
      ) : (
        <div className="overflow-hidden rounded border border-foreground/10">
          <table className="w-full table-fixed border-collapse text-left text-[11px] sm:text-xs">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[32%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="bg-[var(--color-muted)]">
                <th className="px-1.5 py-1.5 sm:px-2">Equipo 1</th>
                <th className="px-2 py-1.5 text-center">G1</th>
                <th className="px-2 py-1.5 text-center">G2</th>
                <th className="px-1.5 py-1.5 sm:px-2">Equipo 2</th>
                <th className="px-2 py-1.5 text-center">Editar</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr
                  key={m.id}
                  className={
                    i % 2 === 0
                      ? "border-t border-foreground/10 bg-[var(--color-surface)]"
                      : "border-t border-foreground/10 bg-[var(--color-muted)]/30"
                  }
                >
                  <td className="truncate px-1.5 py-1.5 sm:px-2">
                    <span className="inline-flex items-center gap-1">
                      {isWinner(m, m.team1Id) ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="h-3 w-3 text-emerald-600"
                          title="Ganador"
                        />
                      ) : isLoser(m, m.team1Id) ? (
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="h-3 w-3 text-red-600"
                          title="Perdedor"
                        />
                      ) : null}
                      <span>{getTeamName(m.team1Id)}</span>
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center font-mono tabular-nums">{m.team1Games}</td>
                  <td className="px-2 py-1.5 text-center font-mono tabular-nums">{m.team2Games}</td>
                  <td className="truncate px-1.5 py-1.5 sm:px-2">
                    <span className="inline-flex items-center gap-1">
                      {isWinner(m, m.team2Id) ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="h-3 w-3 text-emerald-600"
                          title="Ganador"
                        />
                      ) : isLoser(m, m.team2Id) ? (
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="h-3 w-3 text-red-600"
                          title="Perdedor"
                        />
                      ) : null}
                      <span>{getTeamName(m.team2Id)}</span>
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => setEditingId(m.id)}
                      className="inline-flex h-8 w-8 items-center justify-center border-2 border-[var(--color-primary)] bg-[var(--color-muted)] text-[var(--color-primary)] shadow-[2px_2px_0_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5"
                      aria-label="Editar partido"
                      title="Editar partido"
                    >
                      <FontAwesomeIcon icon={faPen} className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingMatch ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md border-4 border-[var(--color-primary)] bg-[var(--color-surface)] p-4 shadow-[8px_8px_0_rgba(0,0,0,0.3)]">
            <h3 className="navbar-text mb-3 text-xs uppercase text-[var(--color-primary)]">
              Editar partido
            </h3>
            <form action={updateAction} className="grid gap-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="matchId" value={editingMatch.id} />

              <label className="flex flex-col gap-1 text-xs">
                Equipo 1
                <select
                  name="team1Id"
                  defaultValue={editingMatch.team1Id ?? ""}
                  className="rounded border border-foreground/20 bg-background px-2 py-2 text-sm"
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs">
                Equipo 2
                <select
                  name="team2Id"
                  defaultValue={editingMatch.team2Id ?? ""}
                  className="rounded border border-foreground/20 bg-background px-2 py-2 text-sm"
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs">
                  G1 (0-6)
                  <input
                    name="team1Games"
                    type="number"
                    min={0}
                    max={6}
                    defaultValue={editingMatch.team1Games}
                    className="rounded border border-foreground/20 bg-background px-2 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  G2 (0-6)
                  <input
                    name="team2Games"
                    type="number"
                    min={0}
                    max={6}
                    defaultValue={editingMatch.team2Games}
                    className="rounded border border-foreground/20 bg-background px-2 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs">
                Winner
                <select
                  name="winnerTeamId"
                  defaultValue={editingMatch.winnerTeamId ?? ""}
                  className="rounded border border-foreground/20 bg-background px-2 py-2 text-sm"
                >
                  <option value="">Sin ganador</option>
                  {editingMatch.team1Id != null ? (
                    <option value={editingMatch.team1Id}>{getTeamName(editingMatch.team1Id)}</option>
                  ) : null}
                  {editingMatch.team2Id != null ? (
                    <option value={editingMatch.team2Id}>{getTeamName(editingMatch.team2Id)}</option>
                  ) : null}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 text-xs">
                <input type="checkbox" name="finished" defaultChecked={editingMatch.finished} />
                Finished
              </label>

              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded border border-foreground/20 bg-background px-3 py-2 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-2 text-xs text-white"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
