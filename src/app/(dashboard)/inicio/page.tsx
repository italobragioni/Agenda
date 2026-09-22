import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, Clock } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { STATUS_INFO } from "@/features/appointments/status";
import { formatCents } from "@/lib/money";
import { formatTimeBR, localDayString, dayRangeUtc } from "@/lib/datetime";
import type { Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Início — Agenda" };

export default async function InicioPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const tz = ctx.business.timezone;
  const today = localDayString(tz);
  const { start, end } = dayRangeUtc(today, tz);

  const { data } = await supabase
    .from("appointments")
    .select("*")
    .gte("start_at", start.toISOString())
    .lt("start_at", end.toISOString())
    .neq("status", "cancelled")
    .order("start_at", { ascending: true });

  const appointments = (data ?? []) as Appointment[];

  const revenueToday = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.price_cents, 0);

  const now = new Date();
  const nextAppointment = appointments.find(
    (a) => a.status === "scheduled" && new Date(a.start_at) >= now,
  );

  const firstName = ctx.profile.full_name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Olá, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">Aqui está o seu dia.</p>
        </div>
        <Link href="/agenda/novo" className="hidden md:block">
          <Button>
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Novo agendamento
          </Button>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Faturamento hoje</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCents(revenueToday)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Agendamentos hoje</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {appointments.length}
          </p>
        </Card>
      </div>

      {nextAppointment && (
        <Card className="mb-6 flex items-center gap-3 border-brand/30 bg-indigo-50/50">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Clock className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Próximo cliente</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {formatTimeBR(nextAppointment.start_at, tz)} ·{" "}
              {nextAppointment.customer_name_snapshot}
            </p>
            <p className="truncate text-xs text-muted">
              {nextAppointment.service_name_snapshot}
            </p>
          </div>
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Agenda de hoje
      </h2>

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nenhum agendamento para hoje"
          description="Que tal criar o primeiro agendamento do dia?"
          action={
            <Link href="/agenda/novo">
              <Button>Criar agendamento</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {appointments.map((a) => (
            <li key={a.id}>
              <Card className="flex items-center gap-3 p-4">
                <div className="w-14 shrink-0 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {formatTimeBR(a.start_at, tz)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {a.customer_name_snapshot}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {a.service_name_snapshot} · {formatCents(a.price_cents)}
                  </p>
                </div>
                <Badge className={STATUS_INFO[a.status].badgeClass}>
                  {STATUS_INFO[a.status].label}
                </Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
