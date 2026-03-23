import Link from "next/link";

import { type Tournament } from "@/data/tournaments";

export type TournamentPastCardProps = {
  tournament: Tournament;
};

/**
 * Fila compacta enlazada para torneos finalizados en `/torneos`.
 */
export function TournamentPastCard({ tournament: t }: TournamentPastCardProps) {
  return (
    <li data-slug={t.slug}>
      <Link
        href={`/torneos/${t.slug}`}
        className="block border-2 border-[var(--color-muted)] bg-[var(--color-surface)] px-4 py-3 text-sm transition hover:border-[var(--color-primary)]"
      >
        <span className="font-medium text-[var(--color-foreground)]">{t.name}</span>
        <span className="text-[var(--color-subtle-text)]"> — {t.dateLabel}</span>
        <p className="mt-1 font-mono text-[10px] text-[var(--color-subtle-text)]">{t.slug}</p>
      </Link>
    </li>
  );
}
