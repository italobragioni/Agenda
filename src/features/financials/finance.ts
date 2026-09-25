import { localDayString, offsetDayString } from "@/lib/datetime";
import { fromZonedTime } from "date-fns-tz";
import type { Appointment } from "@/types/database";

export type Period = "7d" | "30d" | "mes";

export type CompletedAppt = Pick<
  Appointment,
  "start_at" | "price_cents" | "service_name_snapshot" | "status"
>;

/** Início do mês atual (no fuso), em UTC. */
export function monthStartUtc(tz: string): Date {
  const today = localDayString(tz); // yyyy-MM-dd
  const firstDay = `${today.slice(0, 7)}-01`;
  return fromZonedTime(`${firstDay}T00:00:00`, tz);
}

/** Data mais antiga a buscar para cobrir o mês e os últimos 31 dias. */
export function earliestFinanceStart(tz: string): Date {
  const monthStart = monthStartUtc(tz);
  const thirtyStart = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
  return monthStart < thirtyStart ? monthStart : thirtyStart;
}

/** Lista de dias (yyyy-MM-dd) do período selecionado, do mais antigo ao hoje. */
export function periodDayStrings(tz: string, period: Period): string[] {
  const today = localDayString(tz);
  if (period === "mes") {
    const firstDay = Number(today.slice(8, 10)); // dia do mês (1..31)
    const out: string[] = [];
    for (let i = firstDay - 1; i >= 0; i--) out.push(offsetDayString(tz, -i));
    return out;
  }
  const n = period === "7d" ? 7 : 30;
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(offsetDayString(tz, -i));
  return out;
}

/** Agrupa atendimentos finalizados por dia local: dia -> {cents, count}. */
export function bucketByDay(
  completed: CompletedAppt[],
  tz: string,
): Map<string, { cents: number; count: number }> {
  const map = new Map<string, { cents: number; count: number }>();
  for (const a of completed) {
    const day = localDayString(tz, new Date(a.start_at));
    const cur = map.get(day) ?? { cents: 0, count: 0 };
    cur.cents += a.price_cents;
    cur.count += 1;
    map.set(day, cur);
  }
  return map;
}

/** Soma de faturamento (centavos) para um conjunto de dias. */
export function sumForDays(
  bucket: Map<string, { cents: number; count: number }>,
  days: string[],
): { cents: number; count: number } {
  let cents = 0;
  let count = 0;
  for (const d of days) {
    const b = bucket.get(d);
    if (b) {
      cents += b.cents;
      count += b.count;
    }
  }
  return { cents, count };
}

export type EntryLite = {
  type: "income" | "expense";
  amount_cents: number;
  occurred_on: string; // yyyy-MM-dd
};

/** Soma de lançamentos (entradas e saídas) para um conjunto de dias. */
export function sumEntriesForDays(
  entries: EntryLite[],
  daySet: Set<string>,
): { income: number; expense: number } {
  let income = 0;
  let expense = 0;
  for (const e of entries) {
    if (!daySet.has(e.occurred_on)) continue;
    if (e.type === "income") income += e.amount_cents;
    else expense += e.amount_cents;
  }
  return { income, expense };
}

/** Agrupa lançamentos por dia: dia -> {income, expense}. */
export function bucketEntriesByDay(
  entries: EntryLite[],
): Map<string, { income: number; expense: number }> {
  const map = new Map<string, { income: number; expense: number }>();
  for (const e of entries) {
    const cur = map.get(e.occurred_on) ?? { income: 0, expense: 0 };
    if (e.type === "income") cur.income += e.amount_cents;
    else cur.expense += e.amount_cents;
    map.set(e.occurred_on, cur);
  }
  return map;
}

/** Ranking de serviços mais realizados no período. */
export function topServices(
  completed: CompletedAppt[],
  tz: string,
  daySet: Set<string>,
  limit = 5,
): { name: string; count: number; cents: number }[] {
  const map = new Map<string, { count: number; cents: number }>();
  for (const a of completed) {
    const day = localDayString(tz, new Date(a.start_at));
    if (!daySet.has(day)) continue;
    const cur = map.get(a.service_name_snapshot) ?? { count: 0, cents: 0 };
    cur.count += 1;
    cur.cents += a.price_cents;
    map.set(a.service_name_snapshot, cur);
  }
  return [...map.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
