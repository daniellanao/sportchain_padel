"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const inputClass =
  "w-full min-w-0 rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/30 placeholder:text-[color:var(--color-subtle-text)] focus:ring-2";

const rowClass =
  "w-full cursor-pointer border-b border-foreground/10 px-3 py-2.5 text-left text-sm text-foreground last:border-b-0 hover:bg-muted/60";

export type PlayerPickRow = {
  id: number;
  name: string;
  lastname: string;
  email: string | null;
  rating: number;
};

type Props = {
  /** Nombre del campo en el formulario (hidden con el id). */
  name: string;
  /** IDs ya elegidos en otros huecos (no se muestran en resultados). */
  excludedIds: number[];
  /** Texto del placeholder del buscador */
  placeholder?: string;
  /** Para coordinar exclusiones entre varios comboboxes del mismo formulario. */
  onSelectedChange?: (playerId: number | null) => void;
};

function displayLabel(p: PlayerPickRow): string {
  const full = `${p.name} ${p.lastname}`.trim();
  return `${full || "Jugador"} · ELO ${p.rating}`;
}

export function PlayerPickCombobox({ name, excludedIds, placeholder, onSelectedChange }: Props) {
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const onSelectedChangeRef = useRef(onSelectedChange);
  onSelectedChangeRef.current = onSelectedChange;

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<PlayerPickRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlayerPickRow | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const exclusionKey =
    excludedIds.length === 0
      ? ""
      : [...excludedIds].sort((a, b) => a - b).join(",");

  const excludedIdSet = useMemo(() => new Set(excludedIds), [exclusionKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selected && excludedIdSet.has(selected.id)) {
      setSelected(null);
      setQ("");
      onSelectedChangeRef.current?.(null);
    }
  }, [excludedIdSet, selected]);

  useEffect(() => {
    setPlayers((prev) => prev.filter((p) => !excludedIdSet.has(p.id)));
  }, [exclusionKey, excludedIdSet]);

  useEffect(() => {
    if (!modalOpen) return;
    const t = q.trim();
    if (t.length < 2) {
      setPlayers([]);
      setLoading(false);
      setFetchError(null);
      return;
    }

    const ac = new AbortController();
    const timer = setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          setFetchError(null);
          const res = await fetch(
            `/admin/api/players/search?q=${encodeURIComponent(t)}&sort=name`,
            { signal: ac.signal, credentials: "same-origin" },
          );
          const json = (await res.json()) as { players?: PlayerPickRow[]; error?: string };
          if (!res.ok) {
            setPlayers([]);
            setFetchError(
              json.error ??
                (res.status === 401
                  ? "Sesión caducada. Recarga e inicia sesión de nuevo."
                  : "Error al buscar"),
            );
            return;
          }
          const list = (json.players ?? []).filter((p) => !excludedIdSet.has(p.id));
          setPlayers(list);
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          setPlayers([]);
          setFetchError("Error de red al buscar jugadores.");
        } finally {
          setLoading(false);
        }
      })();
    }, 280);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [q, modalOpen, exclusionKey, excludedIdSet]);

  useEffect(() => {
    if (!modalOpen) return;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => searchRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const openModal = useCallback(() => {
    setQ("");
    setPlayers([]);
    setFetchError(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setQ("");
    setPlayers([]);
    setFetchError(null);
    setLoading(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
    onSelectedChangeRef.current?.(null);
  }, []);

  const pick = useCallback((p: PlayerPickRow) => {
    setSelected(p);
    onSelectedChangeRef.current?.(p.id);
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  const modalNode =
    modalOpen && mounted ? (
      <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/55"
          aria-label="Cerrar"
          onClick={closeModal}
        />
        <div
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
          className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-foreground/15 bg-surface shadow-2xl max-h-[min(90vh,600px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-foreground/10 px-4 py-3 sm:px-5">
            <h2 id={titleId} className="text-base font-semibold text-primary">
              Elegir jugador
            </h2>
            <button
              type="button"
              onClick={closeModal}
              className="shrink-0 rounded-lg border border-foreground/15 p-1.5 text-foreground transition hover:bg-muted"
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="shrink-0 border-b border-foreground/10 px-4 py-3 sm:px-5">
            <label className="sr-only" htmlFor={`${titleId}-search`}>
              Buscar jugador
            </label>
            <input
              ref={searchRef}
              id={`${titleId}-search`}
              type="search"
              autoComplete="off"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                placeholder ??
                "Mín. 2 caracteres: apellido, nombre, email o ID"
              }
              className={inputClass}
            />
            {loading ? (
              <p className="mt-2 text-xs text-[color:var(--color-subtle-text)]">Buscando…</p>
            ) : null}
            {fetchError ? (
              <p className="mt-2 text-xs text-red-600 dark:text-red-300" role="alert">
                {fetchError}
              </p>
            ) : null}
          </div>

          <div className="max-h-[min(52vh,380px)] overflow-y-auto overscroll-contain px-1 pb-4 sm:px-2">
            {q.trim().length < 2 ? (
              <p className="px-3 py-6 text-center text-sm text-[color:var(--color-subtle-text)]">
                Escribe al menos dos letras o números para buscar. Los resultados van ordenados por
                apellido y nombre.
              </p>
            ) : !loading && !fetchError && players.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-[color:var(--color-subtle-text)]">
                Sin resultados (o ya elegidos en otro hueco del partido).
              </p>
            ) : (
              <ul role="listbox" className="py-1">
                {players.map((p) => (
                  <li key={p.id} role="option">
                    <button type="button" className={rowClass} onClick={() => pick(p)}>
                      {displayLabel(p)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="min-w-0">
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      {selected ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            className={`${inputClass} flex min-h-[2.75rem] flex-1 items-center border-primary/20 bg-muted/30`}
          >
            <span className="min-w-0 truncate">{displayLabel(selected)}</span>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={openModal}
              className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className={`${inputClass} flex w-full min-h-[2.75rem] items-center justify-between text-left text-[color:var(--color-subtle-text)]`}
        >
          <span>Elegir jugador…</span>
          <span className="text-xs font-medium uppercase tracking-wide text-primary">Buscar</span>
        </button>
      )}

      {mounted && modalNode ? createPortal(modalNode, document.body) : null}
    </div>
  );
}
