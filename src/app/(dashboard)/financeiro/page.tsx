import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { FinanceChart, type FinanceBar } from "@/components/ui/finance-chart";
import { EntryForm } from "@/features/financials/entry-form";
import { EntryDeleteButton } from "@/features/financials/entry-delete-button";
import { formatCents } from "@/lib/money";
import { localDayString, formatDateBR } from "@/lib/datetime";
import {
  earliestFinanceStart,
  periodDayStrings,
  bucketByDay,
  sumForDays,
  bucketEntriesByDay,
  sumEntriesForDays,
  topServices,
  type Period,
  type CompletedAppt,
  type EntryLite,
} from "@/features/financials/finance";
import { cn } from "@/lib/utils";
import type { FinanceEntry } from "@/types/database";

export const metadata: Metadata = { title: "Financeiro — Carvi" };

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "mes", label: "Este mês" },
];

function dayLabel(dayStr: string) {
  const [y, m, d] = dayStr.split("-");
  return { short: `${d}/${m}`, full: `${d}/${m}/${y}` };
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const { p } = await searchParams;
  const period: Period = p === "30d" || p === "mes" ? (p as Period) : "7d";

  const earliest = earliestFinanceStart(tz);
  const earliestDay = localDayString(tz, earliest);

  const supabase = await createClient();
  const [{ data: apptData }, { data: entryData }] = await Promise.all([
    supabase
      .from("appointments")
      .select("start_at, price_cents, service_name_snapshot, status")
      .eq("status", "completed")
      .gte("start_at", earliest.toISOString()),
    supabase
      .from("finance_entries")
      .select("*")
      .gte("occurred_on", earliestDay)
      .order("occurred_on", { ascending: false }),
  ]);

  const completed = (apptData ?? []) as CompletedAppt[];
  const entries = (entryData ?? []) as FinanceEntry[];
  const entriesLite: EntryLite[] = entries.map((e) => ({
    type: e.type,
    amount_cents: e.amount_cents,
    occurred_on: e.occurred_on,
  }));

  const apptBucket = bucketByDay(completed, tz);
  const entryBucket = bucketEntriesByDay(entriesLite);

  const chartDays = periodDayStrings(tz, period);
  const daySet = new Set(chartDays);

  const fatur = sumForDays(apptBucket, chartDays);
  const { income: outras, expense: despesas } = sumEntriesForDays(
    entriesLite,
    daySet,
  );
  const totalEntradas = fatur.cents + outras;
  const lucro = totalEntradas - despesas;
  const ticket = fatur.count > 0 ? Math.round(fatur.cents / fatur.count) : 0;

  const series: FinanceBar[] = chartDays.map((d) => {
    const l = dayLabel(d);
    const ab = apptBucket.get(d);
    const eb = entryBucket.get(d);
    return {
      key: d,
      label: l.short,
      fullLabel: l.full,
      income: (ab?.cents ?? 0) + (eb?.income ?? 0),
      expense: eb?.expense ?? 0,
    };
  });

  const ranking = topServices(completed, tz, daySet);
  const periodEntries = entries.filter((e) => daySet.has(e.occurred_on));
  const today = localDayString(tz);

  const cards = [
    { label: "Faturamento", value: formatCents(fatur.cents), tone: "" },
    { label: "Outras entradas", value: formatCents(outras), tone: "" },
    { label: "Despesas", value: formatCents(despesas), tone: "text-red-600" },
    {
      label: "Lucro",
      value: formatCents(lucro),
      tone: lucro >= 0 ? "text-emerald-600" : "text-red-600",
    },
    { label: "Ticket médio", value: formatCents(ticket), tone: "" },
    { label: "Serviços", value: String(fatur.count), tone: "" },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Financeiro"
        description="Faturamento, despesas e lucro do seu negócio."
        action={
          <a href={`/api/financeiro/export?p=${period}`}>
            <span className="tap inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-slate-50">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </span>
          </a>
        }
      />

      {/* Filtro de período */}
      <div className="mb-4 inline-flex rounded-xl border border-border bg-card p-1">
        {PERIODS.map((tab) => (
          <Link
            key={tab.key}
            href={`/financeiro?p=${tab.key}`}
            className={cn(
              "tap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              period === tab.key
                ? "bg-brand text-brand-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-xs font-medium text-muted">{c.label}</p>
            <p className={cn("mt-1 text-xl font-semibold text-foreground", c.tone)}>
              {c.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Gráfico entradas x saídas */}
      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Entradas × Saídas por dia
        </h2>
        <FinanceChart data={series} />
      </Card>

      {/* Lançamentos */}
      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Lançar despesa ou entrada
        </h2>
        <EntryForm today={today} />

        {periodEntries.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-border pt-4">
            {periodEntries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {e.description || (e.type === "income" ? "Entrada" : "Despesa")}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDateBR(`${e.occurred_on}T12:00:00Z`, "UTC")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "shrink-0 font-semibold",
                      e.type === "income" ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {e.type === "income" ? "+" : "−"}
                    {formatCents(e.amount_cents)}
                  </span>
                  <EntryDeleteButton id={e.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Ranking de serviços */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Serviços mais realizados
        </h2>
        {ranking.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Nenhum serviço finalizado no período.
          </p>
        ) : (
          <ul className="space-y-2">
            {ranking.map((r) => (
              <li
                key={r.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-foreground">{r.name}</span>
                <span className="shrink-0 text-muted">
                  {r.count}× · {formatCents(r.cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
