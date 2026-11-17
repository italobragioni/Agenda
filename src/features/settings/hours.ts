import type { TimeRange } from "@/types/database";

/** "HH:MM:SS" ou "HH:MM" -> "HH:MM". */
export function hhmm(t: string | null | undefined): string {
  return (t ?? "").slice(0, 5);
}

/** Fim de período: "00:00" (input) representa meia-noite = fim do dia = "24:00". */
export function normalizeEnd(end: string): string {
  return end === "00:00" ? "24:00" : end;
}

/** Para o input <time>, que não aceita "24:00": mostra meia-noite como "00:00". */
export function endForInput(end: string): string {
  return end === "24:00" ? "00:00" : hhmm(end);
}

/** Valida um período "HH:MM" com início antes do fim (meia-noite = fim do dia). */
export function isValidRange(r: { start: string; end: string }): boolean {
  if (!/^\d{2}:\d{2}$/.test(r.start) || !/^\d{2}:\d{2}$/.test(r.end)) {
    return false;
  }
  return r.start < normalizeEnd(r.end);
}

/**
 * Lista normalizada dos períodos de um dia, a partir de uma linha de
 * business_hours (que pode ter só start_time/end_time, ou time_ranges).
 * Retorna vazio quando o dia está fechado.
 */
export function rangesForDay(h: {
  is_open?: boolean | null;
  start_time?: string | null;
  end_time?: string | null;
  time_ranges?: TimeRange[] | null;
}): TimeRange[] {
  if (h.is_open === false) return [];
  const list = Array.isArray(h.time_ranges) ? h.time_ranges : [];
  const normalized = list
    .map((r) => ({ start: hhmm(r.start), end: hhmm(r.end) }))
    .filter(isValidRange);
  if (normalized.length > 0) {
    return normalized.sort((a, b) => a.start.localeCompare(b.start));
  }
  // Compatibilidade: um único período vindo de start_time/end_time.
  if (h.start_time && h.end_time) {
    const r = { start: hhmm(h.start_time), end: hhmm(h.end_time) };
    if (isValidRange(r)) return [r];
  }
  return [];
}
