"use client";

import { faMagnifyingGlass, faPen, faUserPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedinIn, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { createPlayerAction, updatePlayerAction } from "@/app/admin/players/actions";

export type AdminPlayerRow = {
  id: number;
  name: string;
  lastname: string;
  email: string | null;
  /** Integer stars from `players.stars` (nullable in DB) */
  stars: number | null;
  linkedin: string | null;
  instagram: string | null;
  x_twitter: string | null;
  /** ISO timestamp from `players.created_at` */
  createdAt: string | null;
};

function normalizeHandle(value: string | null): string | null {
  const v = (value ?? "").trim();
  return v || null;
}

function parseCreatedMs(createdAt: string | null): number {
  if (!createdAt) return Number.NEGATIVE_INFINITY;
  const t = new Date(createdAt).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
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
        aria-labelledby="admin-players-modal-title"
        className="relative z-10 max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-xl border border-foreground/15 bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="admin-players-modal-title" className="text-base font-semibold text-primary">
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

export function AdminPlayersTable({ players }: { players: AdminPlayerRow[] }) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlayerRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...players];

    if (q) {
      const matched = list.filter((p) => {
        const blob =
          `${p.name} ${p.lastname} ${p.email ?? ""} ${p.stars ?? ""} ${p.linkedin ?? ""} ${p.instagram ?? ""} ${p.x_twitter ?? ""}`.toLowerCase();
        return blob.includes(q);
      });
      matched.sort((a, b) => {
        const ln = a.lastname.localeCompare(b.lastname, "es", { sensitivity: "base" });
        if (ln !== 0) return ln;
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      });
      return matched;
    }

    list.sort((a, b) => {
      const diff = parseCreatedMs(b.createdAt) - parseCreatedMs(a.createdAt);
      if (diff !== 0) return diff;
      return b.id - a.id;
    });
    return list;
  }, [players, query]);

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

  const openCreate = () => {
    setEditing(null);
    setCreateOpen(true);
  };

  const openEdit = (p: AdminPlayerRow) => {
    setCreateOpen(false);
    setEditing(p);
  };

  const closeModals = () => {
    setCreateOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="admin-players-search" className="sr-only">
            Buscar jugadores
          </label>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-subtle-text)]"
            aria-hidden
          />
          <input
            id="admin-players-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellidos o email…"
            autoComplete="off"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" aria-hidden />
          Nuevo jugador
        </button>
      </div>

      <p className="text-xs text-[color:var(--color-subtle-text)]">
        Mostrando <span className="tabular-nums font-medium text-foreground">{filtered.length}</span> de{" "}
        <span className="tabular-nums font-medium text-foreground">{players.length}</span>
        {query.trim() ? " (filtrado)" : ""}
      </p>

      <div className="overflow-hidden rounded-lg border border-foreground/10">
        <div className="max-h-[min(60vh,560px)] overflow-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
              <tr>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Apellidos
                </th>
                <th className="min-w-[8rem] px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Email
                </th>
                <th className="whitespace-nowrap px-2 py-2 text-center font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Estrellas
                </th>
                <th className="whitespace-nowrap px-2 py-2 text-center font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Redes
                </th>
                <th className="w-px whitespace-nowrap px-2 py-2 text-right font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Editar
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[color:var(--color-subtle-text)]">
                    {players.length === 0
                      ? "No hay jugadores."
                      : "Ningún jugador coincide con la búsqueda."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/40">
                    <td className="max-w-[10rem] truncate px-2 py-1.5 align-middle font-medium text-foreground" title={p.name}>
                      {p.name}
                    </td>
                    <td className="max-w-[10rem] truncate px-2 py-1.5 align-middle text-foreground" title={p.lastname}>
                      {p.lastname}
                    </td>
                    <td className="max-w-[14rem] truncate px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]" title={p.email ?? ""}>
                      {p.email ?? "—"}
                    </td>
                    <td className="px-2 py-1.5 text-center align-middle tabular-nums text-foreground">
                      {p.stars != null ? p.stars : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-center align-middle">
                      <div className="inline-flex items-center gap-1.5">
                        {normalizeHandle(p.linkedin) ? (
                          <a
                            href={`https://www.linkedin.com/in/${normalizeHandle(p.linkedin)}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`LinkedIn de ${p.name} ${p.lastname}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-foreground/15 text-[#0a66c2] transition hover:bg-muted"
                          >
                            <FontAwesomeIcon icon={faLinkedinIn} className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : null}
                        {normalizeHandle(p.instagram) ? (
                          <a
                            href={`https://www.instagram.com/${normalizeHandle(p.instagram)}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Instagram de ${p.name} ${p.lastname}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-foreground/15 text-[#e1306c] transition hover:bg-muted"
                          >
                            <FontAwesomeIcon icon={faInstagram} className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : null}
                        {normalizeHandle(p.x_twitter) ? (
                          <a
                            href={`https://x.com/${normalizeHandle(p.x_twitter)}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`X de ${p.name} ${p.lastname}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-foreground/15 text-foreground transition hover:bg-muted"
                          >
                            <FontAwesomeIcon icon={faXTwitter} className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        ) : null}
                        {!normalizeHandle(p.linkedin) &&
                        !normalizeHandle(p.instagram) &&
                        !normalizeHandle(p.x_twitter) ? (
                          <span className="text-[color:var(--color-subtle-text)]">—</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-background px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-primary transition hover:bg-muted"
                      >
                        <FontAwesomeIcon icon={faPen} className="h-3 w-3" aria-hidden />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalBackdrop open={createOpen} onClose={closeModals} title="Nuevo jugador">
        <form action={createPlayerAction} className="grid gap-3">
          <label className={labelClass}>
            Nombre
            <input name="name" required autoComplete="given-name" className={inputClass} />
          </label>
          <label className={labelClass}>
            Apellidos
            <input name="lastname" required autoComplete="family-name" className={inputClass} />
          </label>
          <label className={labelClass}>
            Email
            <input name="email" type="email" autoComplete="email" className={inputClass} />
          </label>
          <label className={labelClass}>
            Estrellas
            <input
              name="stars"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              placeholder="Vacío = sin valor"
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            LinkedIn (usuario)
            <input
              name="linkedin"
              placeholder="ej. daniel-lanao"
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Instagram (usuario)
            <input
              name="instagram"
              placeholder="ej. dani.padel"
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            X / Twitter (usuario)
            <input
              name="x_twitter"
              placeholder="ej. daniel_lanao"
              autoComplete="off"
              className={inputClass}
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Crear
            </button>
            <button type="button" onClick={closeModals} className="rounded-lg border border-foreground/20 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
              Cancelar
            </button>
          </div>
        </form>
      </ModalBackdrop>

      <ModalBackdrop
        open={editing != null}
        onClose={closeModals}
        title={editing ? `Editar: ${editing.name} ${editing.lastname}` : "Editar jugador"}
      >
        {editing ? (
          <form key={editing.id} action={updatePlayerAction} className="grid gap-3">
            <input type="hidden" name="id" value={editing.id} />
            <label className={labelClass}>
              Nombre
              <input
                name="name"
                required
                defaultValue={editing.name}
                autoComplete="given-name"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Apellidos
              <input
                name="lastname"
                required
                defaultValue={editing.lastname}
                autoComplete="family-name"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                name="email"
                type="email"
                defaultValue={editing.email ?? ""}
                autoComplete="email"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Estrellas
              <input
                name="stars"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="Vacío = sin valor"
                defaultValue={editing.stars ?? ""}
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              LinkedIn (usuario)
              <input
                name="linkedin"
                defaultValue={editing.linkedin ?? ""}
                placeholder="ej. daniel-lanao"
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Instagram (usuario)
              <input
                name="instagram"
                defaultValue={editing.instagram ?? ""}
                placeholder="ej. dani.padel"
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              X / Twitter (usuario)
              <input
                name="x_twitter"
                defaultValue={editing.x_twitter ?? ""}
                placeholder="ej. daniel_lanao"
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
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
