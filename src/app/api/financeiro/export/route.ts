import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { localDayString, dayRangeUtc } from "@/lib/datetime";
import { periodDayStrings, type Period } from "@/features/financials/finance";
import type { Appointment, FinanceEntry } from "@/types/database";

/** GET /api/financeiro/export?p=7d|30d|mes → baixa CSV do período. */
export async function GET(request: Request) {
  const ctx = await getCurrentContext();
  if (!ctx) return new Response("não autorizado", { status: 401 });
  const tz = ctx.business.timezone;

  const { searchParams } = new URL(request.url);
  const p = searchParams.get("p");
  const period: Period = p === "30d" || p === "mes" ? (p as Period) : "7d";

  const days = periodDayStrings(tz, period);
  const daySet = new Set(days);
  const firstDay = days[0];
  const start = dayRangeUtc(firstDay, tz).start;

  const supabase = await createClient();
  const [{ data: apptData }, { data: entryData }] = await Promise.all([
    supabase
      .from("appointments")
      .select("start_at, price_cents, service_name_snapshot, customer_name_snapshot, status")
      .eq("status", "completed")
      .gte("start_at", start.toISOString()),
    supabase
      .from("finance_entries")
      .select("occurred_on, type, description, amount_cents")
      .gte("occurred_on", firstDay),
  ]);

  type Row = { date: string; tipo: string; descricao: string; valor: number };
  const rows: Row[] = [];

  for (const a of (apptData ?? []) as Appointment[]) {
    const day = localDayString(tz, new Date(a.start_at));
    if (!daySet.has(day)) continue;
    rows.push({
      date: day,
      tipo: "Faturamento",
      descricao: `${a.service_name_snapshot} - ${a.customer_name_snapshot}`,
      valor: a.price_cents,
    });
  }
  for (const e of (entryData ?? []) as FinanceEntry[]) {
    if (!daySet.has(e.occurred_on)) continue;
    rows.push({
      date: e.occurred_on,
      tipo: e.type === "income" ? "Entrada" : "Despesa",
      descricao: e.description ?? "",
      valor: e.type === "expense" ? -e.amount_cents : e.amount_cents,
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const brl = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  const dmy = (d: string) => d.split("-").reverse().join("/");
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const header = "Data;Tipo;Descrição;Valor (R$)";
  const body = rows
    .map((r) => [dmy(r.date), r.tipo, esc(r.descricao), brl(r.valor)].join(";"))
    .join("\n");
  const total = rows.reduce((s, r) => s + r.valor, 0);
  const footer = `;;Saldo do período;${brl(total)}`;

  // BOM para o Excel abrir com acentos corretos.
  const csv = "﻿" + [header, body, footer].filter(Boolean).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="carvi-financeiro-${period}.csv"`,
    },
  });
}
