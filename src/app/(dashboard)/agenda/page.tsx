import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Plus } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AppointmentItem } from "@/features/appointments/appointment-item";
import {
  localDayString,
  offsetDayString,
  dayRangeUtc,
  formatDateBR,
  WEEKDAY_LABELS,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Agenda — Agenda" };

type View = "hoje" | "amanha" | "semana";

const VIEWS: { key: View; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "amanha", label: "Amanhã" },
  { key: "semana", label: "Semana" },
];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const { v } = await searchParams;
  const view: View =
    v === "amanha" || v === "semana" ? (v as View) : "hoje";

  const todayStr = localDayString(tz);
  const tomorrowStr = offsetDayString(tz, 1);

  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === "hoje") {
    ({ start: rangeStart, end: rangeEnd } = dayRangeUtc(todayStr, tz));
  } else if (view === "amanha") {
    ({ start: rangeStart, end: rangeEnd } = dayRangeUtc(tomorrowStr, tz));
  } else {
    const start = dayRangeUtc(todayStr, tz).start;
    rangeStart = start;
    rangeEnd = new Date(start.getTime() + 7 * 86_400_000);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .gte("start_at", rangeStart.toISOString())
    .lt("start_at", rangeEnd.toISOString())
    .order("start_at", { ascending: true });

  const appointments = (data ?? []) as Appointment[];

  // Agrupa por dia local (útil na visão semana).
  const groups = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const key = localDayString(tz, new Date(a.start_at));
    const arr = groups.get(key) ?? [];
    arr.push(a);
    groups.set(key, arr);
  }
  const groupKeys = [...groups.keys()].sort();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Agenda"
        action={
          <Link href="/agenda/novo">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </Link>
        }
      />

      {/* Seletor de visualização */}
      <div className="mb-5 inline-flex rounded-xl border border-border bg-card p-1">
        {VIEWS.map((tab) => (
          <Link
            key={tab.key}
            href={`/agenda?v=${tab.key}`}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              view === tab.key
                ? "bg-brand text-brand-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum agendamento"
          description={
            view === "semana"
              ? "Não há agendamentos nos próximos 7 dias."
              : "Não há agendamentos para este dia."
          }
          action={
            <Link href="/agenda/novo">
              <Button>Criar agendamento</Button>
            </Link>
          }
        />
      ) : view === "semana" ? (
        <div className="space-y-6">
          {groupKeys.map((key) => {
            const items = groups.get(key)!;
            const weekday = new Date(`${key}T00:00:00Z`).getUTCDay();
            return (
              <div key={key}>
                <h2 className="mb-2 text-sm font-semibold text-foreground">
                  {WEEKDAY_LABELS[weekday]} · {formatDateBR(items[0].start_at, tz)}
                </h2>
                <div className="space-y-2">
                  {items.map((a) => (
                    <AppointmentItem key={a.id} appointment={a} tz={tz} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <AppointmentItem key={a.id} appointment={a} tz={tz} />
          ))}
        </div>
      )}
    </div>
  );
}
