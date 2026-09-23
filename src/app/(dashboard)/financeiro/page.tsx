import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { BarChart, type BarDatum } from "@/components/ui/bar-chart";
import { formatCents } from "@/lib/money";
import { localDayString, offsetDayString } from "@/lib/datetime";
import {
  earliestFinanceStart,
  periodDayStrings,
  bucketByDay,
  sumForDays,
  topServices,
  type Period,
  type CompletedAppt,
} from "@/features/financials/finance";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Financeiro — Agenda" };

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

  // Busca ampla o suficiente para cobrir mês e 30 dias.
  const earliest = earliestFinanceStart(tz);

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("start_at, price_cents, service_name_snapshot, status")
    .eq("status", "completed")
    .gte("start_at", earliest.toISOString());

  const completed = (data ?? []) as CompletedAppt[];
  const bucket = bucketByDay(completed, tz);

  const todayStr = localDayString(tz);
  const last7 = Array.from({ length: 7 }, (_, i) => offsetDayString(tz, -i));
  const monthDays = periodDayStrings(tz, "mes");

  const todaySum = sumForDays(bucket, [todayStr]);
  const weekSum = sumForDays(bucket, last7);
  const monthSum = sumForDays(bucket, monthDays);
  const ticket =
    monthSum.count > 0 ? Math.round(monthSum.cents / monthSum.count) : 0;

  const chartDays = periodDayStrings(tz, period);
  const series: BarDatum[] = chartDays.map((d) => {
    const l = dayLabel(d);
    return {
      key: d,
      label: l.short,
      fullLabel: l.full,
      value: bucket.get(d)?.cents ?? 0,
    };
  });

  const ranking = topServices(completed, tz, new Set(chartDays));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Financeiro"
        description="Considera apenas atendimentos finalizados."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Faturamento hoje</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCents(todaySum.cents)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Últimos 7 dias</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCents(weekSum.cents)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Este mês</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCents(monthSum.cents)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Ticket médio (mês)</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCents(ticket)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Serviços no mês</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {monthSum.count}
          </p>
        </Card>
      </div>

      {/* Filtro do gráfico */}
      <div className="mb-3 inline-flex rounded-xl border border-border bg-card p-1">
        {PERIODS.map((tab) => (
          <Link
            key={tab.key}
            href={`/financeiro?p=${tab.key}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              period === tab.key
                ? "bg-brand text-brand-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Faturamento por dia
        </h2>
        <BarChart data={series} />
      </Card>

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
                <span className="min-w-0 truncate text-foreground">
                  {r.name}
                </span>
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
