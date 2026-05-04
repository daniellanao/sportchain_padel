"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionValid } from "@/app/admin/actions";
import { runProcessRatingMatchElo } from "@/lib/rating/run-process-rating-match-elo";
import {
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function ratingMatchPath(id: number): string {
  return `/admin/rating-matches/${id}`;
}

function toPositiveInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? "").trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

const EXPECTED_SLOTS: Array<{ side: number; role: number }> = [
  { side: 1, role: 1 },
  { side: 1, role: 2 },
  { side: 2, role: 1 },
  { side: 2, role: 2 },
];

export async function updateRatingMatchPlayersAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const ratingMatchId = toPositiveInt(formData.get("ratingMatchId"));
  if (!ratingMatchId) {
    redirect(`/admin/tournaments?error=${encodeURIComponent("Rating match inválido.")}`);
  }

  const winnerRaw = String(formData.get("winnerSide") ?? "").trim();
  const winnerSide = winnerRaw === "1" || winnerRaw === "2" ? Number(winnerRaw) : null;
  if (winnerSide == null) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Selecciona el equipo ganador.")}`
    );
  }

  const rowIdEntries = formData.getAll("rowId");
  const playerIdEntries = formData.getAll("playerId");
  if (rowIdEntries.length !== 4 || playerIdEntries.length !== 4) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Formulario incompleto (se esperan 4 jugadores).")}`
    );
  }

  const pairs: { rowId: number; playerId: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const rowId = toPositiveInt(rowIdEntries[i] ?? null);
    const playerId = toPositiveInt(playerIdEntries[i] ?? null);
    if (rowId == null || playerId == null) {
      redirect(
        `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("IDs inválidos.")}`
      );
    }
    pairs.push({ rowId, playerId });
  }

  const chosenPlayers = pairs.map((p) => p.playerId);
  if (new Set(chosenPlayers).size !== 4) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Los cuatro jugadores deben ser distintos.")}`
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Falta configuración de Supabase.")}`
    );
  }

  const { data: rpmRows, error: fetchErr } = await supabase
    .from("rating_match_players")
    .select("id, rating_match_id, side, role")
    .eq("rating_match_id", ratingMatchId)
    .order("side", { ascending: true })
    .order("role", { ascending: true });

  if (fetchErr || !rpmRows || rpmRows.length !== 4) {
    redirect(
      `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent(
        fetchErr?.message ?? "Se esperaban exactamente 4 filas de jugadores."
      )}`
    );
  }

  for (let i = 0; i < 4; i++) {
    const dbRow = rpmRows[i] as { id: number; rating_match_id: number; side: number; role: number };
    const exp = EXPECTED_SLOTS[i];
    if (Number(dbRow.side) !== exp.side || Number(dbRow.role) !== exp.role) {
      redirect(
        `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent(
          "Estructura de jugadores inesperada (side/role)."
        )}`
      );
    }
    if (Number(dbRow.id) !== pairs[i].rowId) {
      redirect(
        `${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent("Datos desincronizados; recarga la página.")}`
      );
    }
  }

  for (let i = 0; i < 4; i++) {
    const { rowId, playerId } = pairs[i];
    const side = EXPECTED_SLOTS[i].side;
    const isWinner = side === winnerSide;
    const { error: upErr } = await supabase
      .from("rating_match_players")
      .update({ player_id: playerId, is_winner: isWinner })
      .eq("id", rowId)
      .eq("rating_match_id", ratingMatchId);

    if (upErr) {
      redirect(`${ratingMatchPath(ratingMatchId)}?error=${encodeURIComponent(upErr.message)}`);
    }
  }

  revalidatePath(ratingMatchPath(ratingMatchId));
  redirect(`${ratingMatchPath(ratingMatchId)}?success=${encodeURIComponent("Jugadores actualizados.")}`);
}

export async function processRatingMatchEloAction(formData: FormData): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) redirect("/admin/login");

  const ratingMatchId = toPositiveInt(formData.get("ratingMatchId"));
  if (!ratingMatchId) {
    redirect(`/admin/tournaments?error=${encodeURIComponent("Rating match inválido.")}`);
  }

  const path = ratingMatchPath(ratingMatchId);
  const result = await runProcessRatingMatchElo(ratingMatchId);
  if (!result.ok) {
    redirect(`${path}?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(path);
  revalidatePath("/admin/matches");
  redirect(`${path}?success=${encodeURIComponent("Elo procesado correctamente.")}`);
}
