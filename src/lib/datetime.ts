import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

/**
 * Utilitários de data/hora com timezone.
 * Regra: guardamos tudo em UTC no banco e convertemos para o timezone do
 * estabelecimento (ex.: America/Sao_Paulo) ao exibir.
 */

/** Retorna a data local (no timezone) como "yyyy-MM-dd". */
export function localDayString(tz: string, date: Date = new Date()): string {
  return formatInTimeZone(date, tz, "yyyy-MM-dd");
}

/**
 * Dado um dia local ("yyyy-MM-dd") e o timezone, retorna o intervalo
 * [início, fim) desse dia em UTC (Date).
 */
export function dayRangeUtc(
  dayStr: string,
  tz: string,
): { start: Date; end: Date } {
  const start = fromZonedTime(`${dayStr}T00:00:00`, tz);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Converte um horário local ("yyyy-MM-dd", "HH:mm") no timezone para UTC. */
export function localToUtc(dayStr: string, timeStr: string, tz: string): Date {
  return fromZonedTime(`${dayStr}T${timeStr}:00`, tz);
}

/** Formata um instante (ISO/Date) como data brasileira: DD/MM/AAAA. */
export function formatDateBR(instant: string | Date, tz: string): string {
  return formatInTimeZone(new Date(instant), tz, "dd/MM/yyyy");
}

/** Formata um instante como horário: HH:mm. */
export function formatTimeBR(instant: string | Date, tz: string): string {
  return formatInTimeZone(new Date(instant), tz, "HH:mm");
}

/** Formata um instante como "DD/MM/AAAA às HH:mm". */
export function formatDateTimeBR(instant: string | Date, tz: string): string {
  return formatInTimeZone(new Date(instant), tz, "dd/MM/yyyy 'às' HH:mm");
}

/** Nomes dos dias da semana (0 = domingo). */
export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
