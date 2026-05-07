import type { Tournament } from "@/data/tournaments";

/**
 * Zona horaria fija del sitio (Argentina, UTC−3, sin horario de verano).
 * Usar siempre al mostrar fechas/horas guardadas en Supabase (timestamptz).
 */
export const PROJECT_TIME_ZONE = "America/Argentina/Buenos_Aires";

function formatToPartsMap(d: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PROJECT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return map;
}

export function formatArgentinaDateISO(d: Date): string {
  const m = formatToPartsMap(d);
  return `${m.year}-${m.month}-${m.day}`;
}

export function formatArgentinaTime24h(d: Date): string {
  const m = formatToPartsMap(d);
  return `${m.hour}:${m.minute}`;
}

export function formatArgentinaDateLabel(d: Date): string {
  return d.toLocaleDateString("es-AR", {
    timeZone: PROJECT_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatArgentinaTimeLabel(d: Date): string {
  return d.toLocaleTimeString("es-AR", {
    timeZone: PROJECT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

/** Etiquetas para tarjetas / listados (open tournaments, etc.). */
export function formatArgentinaStartLabels(start: string | null): { dateLabel: string; timeLabel: string } {
  if (!start) {
    return { dateLabel: "Por confirmar", timeLabel: "—" };
  }
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) {
    return { dateLabel: "Por confirmar", timeLabel: "—" };
  }
  return {
    dateLabel: formatArgentinaDateLabel(d),
    timeLabel: formatArgentinaTimeLabel(d),
  };
}

/** Misma forma que el antiguo `parseStartDate` en `supabase-list` (torneos Sportchain). */
export function parseStartDateArgentina(
  start: string | null,
): Pick<Tournament, "dateISO" | "time24h" | "dateLabel" | "timeLabel"> {
  if (!start) {
    return {
      dateISO: "",
      time24h: "00:00",
      dateLabel: "Por confirmar",
      timeLabel: "—",
    };
  }
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) {
    return {
      dateISO: "",
      time24h: "00:00",
      dateLabel: "Por confirmar",
      timeLabel: "—",
    };
  }
  return {
    dateISO: formatArgentinaDateISO(d),
    time24h: formatArgentinaTime24h(d),
    dateLabel: formatArgentinaDateLabel(d),
    timeLabel: formatArgentinaTimeLabel(d),
  };
}

/**
 * Valor para `<input type="datetime-local" />` en hora Argentina (coherente con lo que ve el usuario).
 */
export function toDatetimeLocalValueArgentina(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const m = formatToPartsMap(d);
  return `${m.year}-${m.month}-${m.day}T${m.hour}:${m.minute}`;
}

/** Fecha y hora legibles (admin, tablas). */
export function formatArgentinaDateTimeMedium(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-AR", {
    timeZone: PROJECT_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
    hourCycle: "h23",
  });
}
