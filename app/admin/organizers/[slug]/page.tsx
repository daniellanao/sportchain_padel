import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import {
  addPlayerToOrganizerAction,
  removePlayerFromOrganizerAction,
  updateOrganizerFromDetailAction,
} from "@/app/admin/organizers/[slug]/actions";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { PlayerSearchPicker } from "@/components/admin/PlayerSearchPicker";
import type { PlayerDbRow } from "@/lib/ranking/supabase-players";
import type { OrganizerDbRow } from "@/lib/organizers/supabase-organizers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin organizador",
  robots: { index: false, follow: false },
};

const adminCtaClass =
  "navbar-text btn-gold inline-flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-lg border-2 border-[var(--color-accent-gold)] px-6 py-3 text-xs uppercase shadow-[4px_4px_0_rgba(0,0,0,0.25)] transition active:brightness-95 sm:w-auto sm:max-w-none sm:min-w-[160px]";

const cardClass = "rounded-xl border border-foreground/10 bg-surface shadow-sm";

const fieldClass =
  "rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2";

const fieldLabelClass =
  "text-xs font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

type RelationPlayer = Pick<PlayerDbRow, "id" | "name" | "lastname" | "email" | "rating">;

type OrganizerPlayerRelation = {
  id: number;
  player_id: number;
  created_at: string | null;
  players: RelationPlayer | RelationPlayer[] | null;
};

function getRelationPlayer(value: OrganizerPlayerRelation["players"]): RelationPlayer | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function AdminOrganizerDetailPage({ params, searchParams }: PageProps) {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const { error: uiError, success } = await searchParams;
  const { slug } = await params;
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    notFound();
  }

  const { data, error } = await supabase
    .from("organizers")
    .select("id, name, slug, image, whatsapp, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const organizer = data as OrganizerDbRow;

  const { data: joinedRows } = await supabase
    .from("organizer_players")
    .select("id, player_id, created_at, players(id, name, lastname, email, rating)")
    .eq("organizer_id", organizer.id)
    .order("created_at", { ascending: true });

  const relations = (joinedRows ?? []) as OrganizerPlayerRelation[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <div className="min-w-0 max-w-3xl px-1">
            <h1 className="logo text-2xl text-primary sm:text-3xl">{organizer.name}</h1>
            <p className="mt-2 text-xs text-[color:var(--color-subtle-text)]">
              <span className="font-mono">{organizer.slug}</span>
            </p>
          </div>

          <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/admin/organizers" className={adminCtaClass}>
              Volver a organizadores
            </Link>
          </div>
        </div>

        {uiError ? (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {uiError}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            {success}
          </p>
        ) : null}

        <section className={`${cardClass} mb-6 p-4 sm:p-6`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Editar organizador
          </h2>
          <form
            action={updateOrganizerFromDetailAction}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <input type="hidden" name="organizerId" value={organizer.id} />
            <input type="hidden" name="currentSlug" value={slug} />
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass}>Nombre *</span>
              <input
                name="name"
                required
                defaultValue={organizer.name}
                autoComplete="organization"
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass}>Slug</span>
              <input
                name="slug"
                defaultValue={organizer.slug}
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass}>Imagen (URL o ruta)</span>
              <input
                name="image"
                type="text"
                defaultValue={organizer.image ?? ""}
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={fieldLabelClass}>WhatsApp (con prefijo, ej. +34600111222)</span>
              <input
                name="whatsapp"
                type="tel"
                defaultValue={organizer.whatsapp ?? ""}
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </section>

        <section className={`${cardClass} overflow-visible p-4 sm:p-6`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-subtle-text)]">
            Jugadores del organizador
          </h2>

          <form action={addPlayerToOrganizerAction} className="mb-6">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="organizerId" value={organizer.id} />
            <p className="mb-3 text-sm text-[color:var(--color-subtle-text)]">
              Busca por texto o ID; solo se cargan coincidencias (max. 25), sin listar toda la base.
            </p>
            <PlayerSearchPicker organizerId={organizer.id} submitClassName="admin-submit-btn" />
          </form>

          {relations.length === 0 ? (
            <p className="text-sm text-[color:var(--color-subtle-text)]">
              No hay jugadores asignados.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-[color:var(--color-subtle-text)]">
                <span className="tabular-nums font-medium text-foreground">{relations.length}</span>{" "}
                {relations.length === 1 ? "jugador asignado" : "jugadores asignados"}.
              </p>
              <div className="overflow-hidden rounded-lg border border-foreground/10">
                <div className="max-h-[min(55vh,480px)] overflow-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="sticky top-0 z-[1] border-b border-foreground/10 bg-muted/90 backdrop-blur-sm">
                      <tr>
                        <th className="w-10 whitespace-nowrap px-2 py-2.5 text-center font-semibold tabular-nums text-[color:var(--color-subtle-text)]">
                          #
                        </th>
                        <th className="px-3 py-2.5 font-semibold text-[color:var(--color-subtle-text)]">
                          Jugador
                        </th>
                        <th className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-[color:var(--color-subtle-text)]">
                          Rating
                        </th>
                        <th className="w-px whitespace-nowrap px-3 py-2.5 text-right font-semibold text-[color:var(--color-subtle-text)]">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relations.map((r, index) => {
                        const player = getRelationPlayer(r.players);
                        const label = player
                          ? `${player.name} ${player.lastname}`
                          : `Jugador #${r.player_id}`;
                        return (
                          <tr
                            key={r.id}
                            className="border-b border-foreground/5 last:border-0 hover:bg-muted/40"
                          >
                            <td className="px-2 py-2 text-center align-middle tabular-nums text-[color:var(--color-subtle-text)]">
                              {index + 1}
                            </td>
                            <td
                              className="max-w-[14rem] truncate px-3 py-2 align-middle font-medium text-foreground"
                              title={label}
                            >
                              {label}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right align-middle tabular-nums font-medium text-foreground">
                              {player != null && player.rating != null ? player.rating : "—"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2 text-right align-middle">
                              <form action={removePlayerFromOrganizerAction} className="inline">
                                <input type="hidden" name="slug" value={slug} />
                                <input type="hidden" name="organizerPlayerId" value={r.id} />
                                <button type="submit" className="admin-danger-btn text-xs">
                                  Quitar
                                </button>
                              </form>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
