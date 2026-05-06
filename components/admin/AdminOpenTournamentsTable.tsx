"use client";

import {
  faCalendarPlus,
  faMagnifyingGlass,
  faPen,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  createOpenTournamentAction,
  deleteOpenTournamentAction,
  updateOpenTournamentAction,
} from "@/app/admin/open-tournaments/actions";

export type AdminOpenTournamentRow = {
  id: number;
  name: string;
  organizerId: number;
  organizerName: string;
  slug: string | null;
  venueId: number | null;
  venueName: string | null;
  startDate: string | null;
  endDate: string | null;
  format: string | null;
  category: string | null;
  createdAt: string | null;
};

export type AdminOrganizerOption = { id: number; name: string };
export type AdminVenueOption = { id: number; name: string };

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputClass =
  "w-full rounded-lg border border-foreground/15 bg-background px-2.5 py-1.5 text-sm text-foreground outline-none ring-primary/40 focus:ring-2";

const labelClass = "flex flex-col gap-1 text-xs font-medium text-[color:var(--color-subtle-text)]";

function ModalBackdrop({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
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
        aria-labelledby="admin-open-tournaments-modal-title"
        className="relative z-10 max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-xl border border-foreground/15 bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="admin-open-tournaments-modal-title" className="text-base font-semibold text-primary">
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

function OrganizerSelect({
  name,
  required,
  organizers,
  defaultValue,
}: {
  name: string;
  required?: boolean;
  organizers: AdminOrganizerOption[];
  defaultValue?: number;
}) {
  return (
    <select
      name={name}
      required={required}
      defaultValue={defaultValue != null ? String(defaultValue) : ""}
      className={inputClass}
    >
      <option value="">
        {organizers.length ? "Elige organizador…" : "Sin organizadores (créalos antes)"}
      </option>
      {organizers.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

function VenueSelect({
  name,
  venues,
  defaultVenueId,
}: {
  name: string;
  venues: AdminVenueOption[];
  defaultVenueId?: number | null;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultVenueId != null ? String(defaultVenueId) : ""}
      className={inputClass}
    >
      <option value="">Sin sede</option>
      {venues.map((v) => (
        <option key={v.id} value={v.id}>
          {v.name}
        </option>
      ))}
    </select>
  );
}

export function AdminOpenTournamentsTable({
  rows,
  organizers,
  venues,
}: {
  rows: AdminOpenTournamentRow[];
  organizers: AdminOrganizerOption[];
  venues: AdminVenueOption[];
}) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminOpenTournamentRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...rows];
    if (!q) return list;
    return list.filter((r) => {
      const blob = [
        r.name,
        r.slug ?? "",
        r.venueName ?? "",
        r.organizerName,
        r.category ?? "",
        r.format ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, query]);

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

  const canCreate = organizers.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="admin-open-tournaments-search" className="sr-only">
            Buscar torneos abiertos
          </label>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-subtle-text)]"
            aria-hidden
          />
          <input
            id="admin-open-tournaments-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, slug, sede, organizador…"
            autoComplete="off"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          type="button"
          disabled={!canCreate}
          onClick={() => {
            setEditing(null);
            setCreateOpen(true);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faCalendarPlus} className="h-4 w-4" aria-hidden />
          Nuevo torneo abierto
        </button>
      </div>

      {!canCreate ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Añade al menos un organizador en{" "}
          <a href="/admin/organizers" className="font-medium underline underline-offset-2">
            Organizadores
          </a>{" "}
          antes de crear un torneo abierto.
        </p>
      ) : null}
      {venues.length === 0 ? (
        <p className="text-sm text-[color:var(--color-subtle-text)]">
          Opcional: define sedes en{" "}
          <a href="/admin/venues" className="font-medium text-primary underline underline-offset-2">
            Sedes
          </a>{" "}
          para enlazar el lugar del torneo.
        </p>
      ) : null}

      <p className="text-xs text-[color:var(--color-subtle-text)]">
        Mostrando <span className="tabular-nums font-medium text-foreground">{filtered.length}</span> de{" "}
        <span className="tabular-nums font-medium text-foreground">{rows.length}</span>
        {query.trim() ? " (filtrado)" : ""}
      </p>

      <div className="overflow-hidden rounded-lg border border-foreground/10">
        <div className="max-h-[min(62vh,600px)] overflow-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
              <tr>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Organizador
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Slug
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Sede
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Inicio
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Fin
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Formato
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Cat.
                </th>
                <th className="w-px whitespace-nowrap px-2 py-2 text-right font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-[color:var(--color-subtle-text)]">
                    {rows.length === 0
                      ? "No hay torneos abiertos."
                      : "Ningún registro coincide con la búsqueda."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/40">
                    <td className="max-w-[11rem] truncate px-2 py-1.5 align-middle font-medium text-foreground" title={r.name}>
                      {r.name}
                    </td>
                    <td className="max-w-[9rem] truncate px-2 py-1.5 align-middle text-foreground" title={r.organizerName}>
                      {r.organizerName}
                    </td>
                    <td className="max-w-[8rem] truncate px-2 py-1.5 align-middle font-mono text-[11px] text-[color:var(--color-subtle-text)]" title={r.slug ?? ""}>
                      {r.slug ?? "—"}
                    </td>
                    <td className="max-w-[8rem] truncate px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]" title={r.venueName ?? ""}>
                      {r.venueName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]">
                      {formatDateShort(r.startDate)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]">
                      {formatDateShort(r.endDate)}
                    </td>
                    <td className="max-w-[6rem] truncate px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]" title={r.format ?? ""}>
                      {r.format ?? "—"}
                    </td>
                    <td className="max-w-[5rem] truncate px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]" title={r.category ?? ""}>
                      {r.category ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right align-middle">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCreateOpen(false);
                            setEditing(r);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-background px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-primary transition hover:bg-muted"
                        >
                          <FontAwesomeIcon icon={faPen} className="h-3 w-3" aria-hidden />
                          Editar
                        </button>
                        <form action={deleteOpenTournamentAction} className="inline">
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            onClick={(e) => {
                              if (!window.confirm(`¿Eliminar «${r.name}»?`)) {
                                e.preventDefault();
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-background px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-red-700 transition hover:bg-red-500/10 dark:text-red-300"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" aria-hidden />
                            Borrar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalBackdrop open={createOpen} onClose={closeModals} title="Nuevo torneo abierto">
        <form action={createOpenTournamentAction} className="grid gap-3 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Nombre
            <input name="name" required autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>
            Organizador
            <OrganizerSelect name="organizer_id" required organizers={organizers} />
          </label>
          <label className={labelClass}>
            Slug (opcional)
            <input name="slug" placeholder="se genera del nombre si vacío" autoComplete="off" className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Sede (opcional)
            <VenueSelect name="venue_id" venues={venues} />
          </label>
          <label className={labelClass}>
            Categoría
            <input name="category" autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>
            Formato
            <input name="format" placeholder="americano" defaultValue="americano" autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>
            Inicio
            <input name="start_date" type="datetime-local" className={inputClass} />
          </label>
          <label className={labelClass}>
            Fin
            <input name="end_date" type="datetime-local" className={inputClass} />
          </label>
          <div className="mt-2 flex flex-wrap gap-2 sm:col-span-2">
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

      <ModalBackdrop open={editing != null} onClose={closeModals} title={editing ? `Editar: ${editing.name}` : "Editar"}>
        {editing ? (
          <form key={editing.id} action={updateOpenTournamentAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={editing.id} />
            <label className={`${labelClass} sm:col-span-2`}>
              Nombre
              <input name="name" required defaultValue={editing.name} autoComplete="off" className={inputClass} />
            </label>
            <label className={labelClass}>
              Organizador
              <OrganizerSelect
                name="organizer_id"
                required
                organizers={organizers}
                defaultValue={editing.organizerId}
              />
            </label>
            <label className={labelClass}>
              Slug (vacío = sin slug)
              <input
                name="slug"
                defaultValue={editing.slug ?? ""}
                placeholder="opcional"
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Sede (opcional)
              <VenueSelect name="venue_id" venues={venues} defaultVenueId={editing.venueId} />
            </label>
            <label className={labelClass}>
              Categoría
              <input name="category" defaultValue={editing.category ?? ""} autoComplete="off" className={inputClass} />
            </label>
            <label className={labelClass}>
              Formato
              <input name="format" defaultValue={editing.format ?? ""} placeholder="americano" autoComplete="off" className={inputClass} />
            </label>
            <label className={labelClass}>
              Inicio
              <input
                name="start_date"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(editing.startDate)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Fin
              <input
                name="end_date"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(editing.endDate)}
                className={inputClass}
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2 sm:col-span-2">
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
