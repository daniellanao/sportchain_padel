"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const inputClass =
  "w-full min-w-0 rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/30 placeholder:text-[color:var(--color-subtle-text)] focus:ring-2";

const listClass =
  "absolute left-0 right-0 top-full z-[100] mt-1 max-h-52 overflow-y-auto rounded-lg border border-foreground/10 bg-surface shadow-lg";

const rowClass =
  "w-full cursor-pointer border-b border-foreground/10 px-3 py-2.5 text-left text-sm text-foreground last:border-b-0 hover:bg-muted/60";

export type PlayerSearchRow = {
  id: number;
  name: string;
  lastname: string;
  email: string | null;
  rating: number;
};

type Props = {
  tournamentId: number;
  submitClassName: string;
};

export function PlayerSearchPicker({ tournamentId, submitClassName }: Props) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [players, setPlayers] = useState<PlayerSearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PlayerSearchRow | null>(null);
  const [open, setOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    if (selected) return;
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
            `/api/admin/players/search?q=${encodeURIComponent(t)}&tournamentId=${tournamentId}`,
            { signal: ac.signal, credentials: "same-origin" }
          );
          const json = (await res.json()) as { players?: PlayerSearchRow[]; error?: string };
          if (!res.ok) {
            setPlayers([]);
            setFetchError(
              json.error ??
                (res.status === 401 ? "Sesion caducada. Recarga e inicia sesion de nuevo." : "Error al buscar")
            );
            setOpen(true);
            return;
          }
          setPlayers(json.players ?? []);
          setOpen(true);
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
          setPlayers([]);
          setFetchError("Error de red al buscar jugadores.");
        } finally {
          setLoading(false);
        }
      })();
    }, 320);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [q, selected, tournamentId]);

  const clearSelection = useCallback(() => {
    setSelected(null);
    setQ("");
    setPlayers([]);
    setOpen(false);
    setFetchError(null);
  }, []);

  const pick = useCallback((p: PlayerSearchRow) => {
    setSelected(p);
    setQ("");
    setPlayers([]);
    setOpen(false);
  }, []);

  function label(p: PlayerSearchRow) {
    const mail = p.email ? ` · ${p.email}` : "";
    return `${p.name} ${p.lastname}${mail} · ELO ${p.rating}`;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
      <div ref={containerRef} className="relative z-10 min-w-0 flex-1 overflow-visible">
        <input type="hidden" name="playerId" value={selected?.id ?? ""} />

        {selected ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div
              className={`${inputClass} flex min-h-[2.75rem] items-center border-primary/20 bg-muted/30`}
            >
              <span className="truncate">{label(selected)}</span>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <>
            <input
              type="search"
              autoComplete="off"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => {
                if (players.length > 0) setOpen(true);
              }}
              placeholder="Buscar (min. 2 caracteres): nombre, apellido, email o ID"
              className={inputClass}
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={open}
            />
            {loading ? (
              <p className="mt-1.5 text-xs text-[color:var(--color-subtle-text)]">Buscando...</p>
            ) : null}
            {fetchError ? (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-300" role="alert">
                {fetchError}
              </p>
            ) : null}
            {open && players.length > 0 ? (
              <ul id={listboxId} role="listbox" className={listClass}>
                {players.map((p) => (
                  <li key={p.id} role="option">
                    <button type="button" className={rowClass} onClick={() => pick(p)}>
                      {label(p)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {open && !loading && !fetchError && q.trim().length >= 2 && players.length === 0 ? (
              <p className="mt-1.5 text-xs text-[color:var(--color-subtle-text)]">
                Sin resultados (ya inscritos o no coinciden).
              </p>
            ) : null}
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={!selected}
        className={submitClassName}
        title={!selected ? "Elige un jugador" : undefined}
      >
        Anadir
      </button>
    </div>
  );
}
