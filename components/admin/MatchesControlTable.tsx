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
  court: number | null;
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
  const inputClass =
    "rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2";

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
        <div className="overflow-hidden rounded-xl border border-foreground/10 bg-surface shadow-sm">
          <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[29%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[29%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/80">
                <th className="px-2 py-2.5 text-center font-semibold text-[color:var(--color-subtle-text)]">
                  C
                </th>
                <th className="px-2 py-2.5 font-semibold text-[color:var(--color-subtle-text)] sm:px-3">
                  Equipo 1
                </th>
                <th className="px-2 py-2.5 text-center font-semibold text-[color:var(--color-subtle-text)]">
                  G1
                </th>
                <th className="px-2 py-2.5 text-center font-semibold text-[color:var(--color-subtle-text)]">
                  G2
                </th>
                <th className="px-2 py-2.5 font-semibold text-[color:var(--color-subtle-text)] sm:px-3">
                  Equipo 2
                </th>
                <th className="px-2 py-2.5 text-center font-semibold text-[color:var(--color-subtle-text)]">
                  Editar
                </th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr
                  key={m.id}
                  className={
                    i % 2 === 0
                      ? "border-t border-foreground/10 bg-background/70"
                      : "border-t border-foreground/10 bg-muted/25"
                  }
                >
                  <td className="px-2 py-2 text-center align-middle font-mono tabular-nums text-[color:var(--color-subtle-text)]">
                    {m.court != null ? `C${m.court}` : "—"}
                  </td>
                  <td className="truncate px-2 py-2 align-middle sm:px-3">
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
                  <td className="px-2 py-2 text-center align-middle font-mono tabular-nums">
                    {m.team1Games}
                  </td>
                  <td className="px-2 py-2 text-center align-middle font-mono tabular-nums">
                    {m.team2Games}
                  </td>
                  <td className="truncate px-2 py-2 align-middle sm:px-3">
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
                  <td className="px-2 py-2 text-center align-middle">
                    <button
                      type="button"
                      onClick={() => setEditingId(m.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-foreground/20 bg-background text-primary transition hover:bg-muted"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar"
            onClick={() => setEditingId(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-foreground/15 bg-surface p-5 shadow-xl">
            <h3 className="mb-4 text-base font-semibold text-primary">Editar partido</h3>
            <form action={updateAction} className="grid gap-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="matchId" value={editingMatch.id} />

              <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]">
                Equipo 1
                <select
                  name="team1Id"
                  defaultValue={editingMatch.team1Id ?? ""}
                  className={inputClass}
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]">
                Equipo 2
                <select
                  name="team2Id"
                  defaultValue={editingMatch.team2Id ?? ""}
                  className={inputClass}
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
                <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]">
                  G1 (0-6)
                  <input
                    name="team1Games"
                    type="number"
                    min={0}
                    max={6}
                    defaultValue={editingMatch.team1Games}
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]">
                  G2 (0-6)
                  <input
                    name="team2Games"
                    type="number"
                    min={0}
                    max={6}
                    defaultValue={editingMatch.team2Games}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]">
                Winner
                <select
                  name="winnerTeamId"
                  defaultValue={editingMatch.winnerTeamId ?? ""}
                  className={inputClass}
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

              <label className="inline-flex items-center gap-2 text-xs font-medium text-[color:var(--color-subtle-text)]">
                <input type="checkbox" name="finished" defaultChecked={editingMatch.finished} />
                Finished
              </label>

              <div className="mt-2 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-foreground/20 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
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
