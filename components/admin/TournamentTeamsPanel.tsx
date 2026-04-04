"use client";

import { faPen, faPlus, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, type ReactNode } from "react";

import {
  createTeamAction,
  deleteTeamAction,
  updateTeamAction,
} from "@/app/admin/tournaments/[slug]/teams/actions";

export type TeamPlayerOption = {
  id: number;
  name: string;
  lastname: string;
  rating: number;
};

export type TeamListRow = {
  id: number;
  player1_id: number;
  player2_id: number;
  team_name: string | null;
};

const selectClass =
  "w-full rounded-lg border border-foreground/15 bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-primary/40 focus:ring-2";

const inputClass =
  "w-full rounded-lg border border-foreground/15 bg-background px-2.5 py-1.5 text-sm text-foreground outline-none ring-primary/40 focus:ring-2";

const labelClass = "flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]";

function playerShort(p: TeamPlayerOption): string {
  return `${p.name} ${p.lastname}`;
}

function ModalBackdrop({
  open,
  onClose,
  title,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-xl border border-foreground/15 bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-base font-semibold text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-foreground/15 p-1.5 text-foreground transition hover:bg-muted"
            aria-label="Cerrar"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Props = {
  slug: string;
  tournamentId: number;
  players: TeamPlayerOption[];
  teams: TeamListRow[];
};

export function TournamentTeamsPanel({ slug, tournamentId, players, teams }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TeamListRow | null>(null);

  const playersById = new Map(players.map((p) => [p.id, p]));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateOpen(false);
        setEditing(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (createOpen || editing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [createOpen, editing]);

  const closeModals = () => {
    setCreateOpen(false);
    setEditing(null);
  };

  const openCreate = () => {
    setEditing(null);
    setCreateOpen(true);
  };

  const openEdit = (t: TeamListRow) => {
    setCreateOpen(false);
    setEditing(t);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
          Equipos del torneo
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" aria-hidden />
          Nuevo equipo
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-foreground/10">
        <div className="max-h-[min(65vh,600px)] overflow-auto">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
              <tr>
                <th className="w-8 whitespace-nowrap px-1.5 py-1.5 text-center font-semibold tabular-nums text-[color:var(--color-subtle-text)]">
                  #
                </th>
                <th className="whitespace-nowrap px-2 py-1.5 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Equipo
                </th>
                <th className="whitespace-nowrap px-2 py-1.5 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  J1
                </th>
                <th className="whitespace-nowrap px-2 py-1.5 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  J2
                </th>
                <th className="w-px whitespace-nowrap px-2 py-1.5 text-right font-semibold uppercase text-[color:var(--color-subtle-text)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-[color:var(--color-subtle-text)]">
                    Aún no hay equipos.
                  </td>
                </tr>
              ) : (
                teams.map((team, index) => {
                  const p1 = playersById.get(team.player1_id);
                  const p2 = playersById.get(team.player2_id);
                  return (
                    <tr key={team.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/30">
                      <td className="px-1.5 py-1 text-center align-middle tabular-nums text-[color:var(--color-subtle-text)]">
                        {index + 1}
                      </td>
                      <td className="max-w-[9rem] truncate px-2 py-1 align-middle font-medium text-foreground" title={team.team_name ?? ""}>
                        {team.team_name ?? "—"}
                      </td>
                      <td className="max-w-[7rem] truncate px-2 py-1 align-middle text-[color:var(--color-subtle-text)]" title={p1 ? playerShort(p1) : ""}>
                        {p1 ? playerShort(p1) : `#${team.player1_id}`}
                      </td>
                      <td className="max-w-[7rem] truncate px-2 py-1 align-middle text-[color:var(--color-subtle-text)]" title={p2 ? playerShort(p2) : ""}>
                        {p2 ? playerShort(p2) : `#${team.player2_id}`}
                      </td>
                      <td className="whitespace-nowrap px-2 py-1 align-middle">
                        <div className="flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(team)}
                            className="inline-flex items-center gap-0.5 rounded border border-foreground/15 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary transition hover:bg-muted"
                          >
                            <FontAwesomeIcon icon={faPen} className="h-2.5 w-2.5" aria-hidden />
                            Editar
                          </button>
                          <form
                            action={deleteTeamAction}
                            className="inline"
                            onSubmit={(e) => {
                              if (!confirm("¿Eliminar este equipo?")) e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="slug" value={slug} />
                            <input type="hidden" name="teamId" value={team.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-0.5 rounded border border-red-400/40 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-200 transition hover:bg-red-500/20"
                            >
                              <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" aria-hidden />
                              Borrar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalBackdrop
        open={createOpen}
        onClose={closeModals}
        title="Nuevo equipo"
        titleId="teams-modal-create"
      >
        <form action={createTeamAction} className="grid gap-3">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="tournamentId" value={tournamentId} />
          <label className={labelClass}>
            Jugador 1
            <select name="player1Id" required className={selectClass} defaultValue="">
              <option value="" disabled>
                Seleccionar…
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.lastname} (ELO {p.rating})
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Jugador 2
            <select name="player2Id" required className={selectClass} defaultValue="">
              <option value="" disabled>
                Seleccionar…
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.lastname} (ELO {p.rating})
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-[color:var(--color-subtle-text)]">
            El nombre del equipo se guardará como «nombre1 & nombre2» (solo nombres de pila).
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={closeModals}
              className="rounded-lg border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      </ModalBackdrop>

      <ModalBackdrop
        open={editing != null}
        onClose={closeModals}
        title={editing ? "Editar equipo" : "Editar"}
        titleId="teams-modal-edit"
      >
        {editing ? (
          <form key={editing.id} action={updateTeamAction} className="grid gap-3">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="teamId" value={editing.id} />
            <label className={labelClass}>
              Jugador 1
              <select name="player1Id" required className={selectClass} defaultValue={editing.player1_id}>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.lastname} (ELO {p.rating})
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Jugador 2
              <select name="player2Id" required className={selectClass} defaultValue={editing.player2_id}>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.lastname} (ELO {p.rating})
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Nombre del equipo (opcional)
              <input
                name="teamName"
                type="text"
                defaultValue={editing.team_name ?? ""}
                placeholder="Vacío = nombre1 & nombre2"
                className={inputClass}
              />
            </label>
            <p className="text-xs text-[color:var(--color-subtle-text)]">
              Si lo dejas vacío, se recalcula con los nombres de pila de los jugadores elegidos (orden de los desplegables).
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={closeModals}
                className="rounded-lg border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}
      </ModalBackdrop>
    </div>
  );
}
