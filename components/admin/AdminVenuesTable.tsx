"use client";

import {
  faMagnifyingGlass,
  faPen,
  faTrash,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { createVenueAction, deleteVenueAction, updateVenueAction } from "@/app/admin/venues/actions";

export type AdminVenueRow = {
  id: number;
  name: string;
  slug: string | null;
  image: string | null;
  stars: number | null;
  address: string | null;
  web: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string | null;
};

function parseCreatedMs(createdAt: string | null): number {
  if (!createdAt) return Number.NEGATIVE_INFINITY;
  const t = new Date(createdAt).getTime();
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

function formatStars(s: number | null): string {
  if (s == null || Number.isNaN(s)) return "—";
  return String(Math.round(s * 10) / 10);
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
        aria-labelledby="admin-venues-modal-title"
        className="relative z-10 max-h-[min(92vh,720px)] w-full max-w-lg overflow-y-auto rounded-xl border border-foreground/15 bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="admin-venues-modal-title" className="text-base font-semibold text-primary">
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

function VenueThumb({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin preview; mixed local + external URLs
    <img src={src} alt={alt} className="h-8 w-8 rounded object-cover" width={32} height={32} />
  );
}

export function AdminVenuesTable({ venues }: { venues: AdminVenueRow[] }) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminVenueRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...venues];

    if (q) {
      return list
        .filter((v) => {
          const blob = [
            v.name,
            v.slug ?? "",
            v.image ?? "",
            v.address ?? "",
            v.web ?? "",
            v.phone ?? "",
            v.stars ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return blob.includes(q);
        })
        .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
    }

    list.sort((a, b) => {
      const diff = parseCreatedMs(b.createdAt) - parseCreatedMs(a.createdAt);
      if (diff !== 0) return diff;
      return b.id - a.id;
    });
    return list;
  }, [venues, query]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="admin-venues-search" className="sr-only">
            Buscar sedes
          </label>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-subtle-text)]"
            aria-hidden
          />
          <input
            id="admin-venues-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, slug, dirección, teléfono…"
            autoComplete="off"
            className={`${inputClass} pl-9`}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreateOpen(true);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" aria-hidden />
          Nueva sede
        </button>
      </div>

      <p className="text-xs text-[color:var(--color-subtle-text)]">
        Mostrando <span className="tabular-nums font-medium text-foreground">{filtered.length}</span> de{" "}
        <span className="tabular-nums font-medium text-foreground">{venues.length}</span>
        {query.trim() ? " (filtrado)" : ""}
      </p>

      <div className="overflow-hidden rounded-lg border border-foreground/10">
        <div className="max-h-[min(60vh,560px)] overflow-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs">
            <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
              <tr>
                <th className="w-px whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Img
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Slug
                </th>
                <th className="whitespace-nowrap px-2 py-2 text-center font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  ★
                </th>
                <th className="min-w-[8rem] px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Dirección
                </th>
                <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Tel.
                </th>
                <th className="w-px whitespace-nowrap px-2 py-2 text-right font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[color:var(--color-subtle-text)]">
                    {venues.length === 0 ? "No hay sedes." : "Ninguna sede coincide con la búsqueda."}
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/40">
                    <td className="px-2 py-1.5 align-middle">
                      {v.image?.trim() ? (
                        <VenueThumb src={v.image.trim()} alt={v.name} />
                      ) : (
                        <span className="inline-block h-8 w-8 rounded bg-muted" aria-hidden />
                      )}
                    </td>
                    <td className="max-w-[11rem] truncate px-2 py-1.5 align-middle font-medium text-foreground" title={v.name}>
                      {v.name}
                    </td>
                    <td className="max-w-[8rem] truncate px-2 py-1.5 align-middle font-mono text-[11px] text-[color:var(--color-subtle-text)]" title={v.slug ?? ""}>
                      {v.slug ?? "—"}
                    </td>
                    <td className="px-2 py-1.5 text-center align-middle tabular-nums text-foreground">{formatStars(v.stars)}</td>
                    <td className="max-w-[12rem] truncate px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]" title={v.address ?? ""}>
                      {v.address ?? "—"}
                    </td>
                    <td className="max-w-[7rem] truncate px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]" title={v.phone ?? ""}>
                      {v.phone ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right align-middle">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCreateOpen(false);
                            setEditing(v);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-background px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-primary transition hover:bg-muted"
                        >
                          <FontAwesomeIcon icon={faPen} className="h-3 w-3" aria-hidden />
                          Editar
                        </button>
                        <form action={deleteVenueAction} className="inline">
                          <input type="hidden" name="id" value={v.id} />
                          <button
                            type="submit"
                            onClick={(e) => {
                              if (!window.confirm(`¿Eliminar sede «${v.name}»?`)) {
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

      <ModalBackdrop open={createOpen} onClose={closeModals} title="Nueva sede">
        <form action={createVenueAction} className="grid gap-3 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Nombre
            <input name="name" required autoComplete="off" className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Slug (opcional; se genera del nombre si vacío)
            <input name="slug" placeholder="ej. club-norte" autoComplete="off" className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Imagen (URL o ruta)
            <input name="image" type="text" autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>
            Estrellas (0–9,9)
            <input name="stars" type="number" min={0} max={9.9} step={0.1} placeholder="vacío = sin valor" className={inputClass} />
          </label>
          <label className={labelClass}>
            Teléfono
            <input name="phone" type="tel" autoComplete="off" className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Dirección
            <input name="address" autoComplete="street-address" className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Web
            <input name="web" type="url" placeholder="https://…" autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>
            Latitud
            <input name="lat" inputMode="decimal" placeholder="ej. 40.4168" autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>
            Longitud
            <input name="lng" inputMode="decimal" placeholder="ej. -3.7038" autoComplete="off" className={inputClass} />
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
          <form key={editing.id} action={updateVenueAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={editing.id} />
            <label className={`${labelClass} sm:col-span-2`}>
              Nombre
              <input name="name" required defaultValue={editing.name} autoComplete="off" className={inputClass} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Slug (vacío = sin slug)
              <input name="slug" defaultValue={editing.slug ?? ""} placeholder="opcional" autoComplete="off" className={inputClass} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Imagen (URL o ruta)
              <input name="image" type="text" defaultValue={editing.image ?? ""} autoComplete="off" className={inputClass} />
            </label>
            <label className={labelClass}>
              Estrellas (0–9,9)
              <input
                name="stars"
                type="number"
                min={0}
                max={9.9}
                step={0.1}
                placeholder="vacío = sin valor"
                defaultValue={editing.stars ?? ""}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Teléfono
              <input name="phone" type="tel" defaultValue={editing.phone ?? ""} autoComplete="off" className={inputClass} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Dirección
              <input name="address" defaultValue={editing.address ?? ""} autoComplete="street-address" className={inputClass} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Web
              <input
                name="web"
                type="url"
                placeholder="https://…"
                defaultValue={editing.web ?? ""}
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Latitud
              <input
                name="lat"
                inputMode="decimal"
                defaultValue={editing.lat ?? ""}
                placeholder="ej. 40.4168"
                autoComplete="off"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Longitud
              <input
                name="lng"
                inputMode="decimal"
                defaultValue={editing.lng ?? ""}
                placeholder="ej. -3.7038"
                autoComplete="off"
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
