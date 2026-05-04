"use client";

import { faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import type { AdminRatingMatchListRow } from "@/lib/rating/supabase-rating-matches-list";

function formatPlayedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function PairCell({
  label,
  showCrown,
  title,
}: {
  label: string;
  showCrown: boolean;
  title: string;
}) {
  return (
    <td className="max-w-[14rem] px-2 py-1.5 align-middle text-foreground" title={title}>
      <div className="flex items-start gap-1.5">
        {showCrown ? (
          <span
            className="mt-0.5 shrink-0 text-[var(--color-accent-gold)]"
            title="Pareja ganadora"
            aria-label="Pareja ganadora"
          >
            <FontAwesomeIcon icon={faCrown} className="h-3 w-3" aria-hidden />
          </span>
        ) : (
          <span className="mt-0.5 inline-flex h-3 w-3 shrink-0 justify-center" aria-hidden />
        )}
        <span className="line-clamp-2 min-w-0 flex-1">{label}</span>
      </div>
    </td>
  );
}

export function AdminRatingMatchesTable({ matches }: { matches: AdminRatingMatchListRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-foreground/10">
      <div className="max-h-[min(70vh,720px)] overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
            <tr>
              <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                Id
              </th>
              <th className="whitespace-nowrap px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                Fecha
              </th>
              <th className="min-w-[9rem] px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                Pareja 1
              </th>
              <th className="min-w-[9rem] px-2 py-2 font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
                Pareja 2
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-[color:var(--color-subtle-text)]">
                  No hay partidos de rating.
                </td>
              </tr>
            ) : (
              matches.map((m) => (
                <tr key={m.id} className="border-b border-foreground/5 last:border-0 hover:bg-muted/40">
                  <td className="whitespace-nowrap px-2 py-1.5 align-middle tabular-nums">
                    <Link
                      href={`/admin/rating-matches/${m.id}`}
                      className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                    >
                      {m.id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-2 py-1.5 align-middle text-[color:var(--color-subtle-text)]">
                    {formatPlayedAt(m.playedAt)}
                  </td>
                  <PairCell
                    label={m.side1Label}
                    title={m.side1Label}
                    showCrown={m.winningSide === 1}
                  />
                  <PairCell
                    label={m.side2Label}
                    title={m.side2Label}
                    showCrown={m.winningSide === 2}
                  />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
