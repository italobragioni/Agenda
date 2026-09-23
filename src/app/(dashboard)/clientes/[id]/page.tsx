import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Phone, CalendarClock } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { STATUS_INFO } from "@/features/appointments/status";
import { formatCents } from "@/lib/money";
import { formatPhone } from "@/lib/phone";
import { formatDateTimeBR } from "@/lib/datetime";
import type { Customer, Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Cliente — Agenda" };

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const supabase = await createClient();
  const { data: customerData } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!customerData) notFound();
  const customer = customerData as Customer;

  const { data: apptData } = await supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", id)
    .order("start_at", { ascending: false });
  const appointments = (apptData ?? []) as Appointment[];

  const completed = appointments.filter((a) => a.status === "completed");
  const totalSpent = completed.reduce((sum, a) => sum + a.price_cents, 0);

  const now = new Date();
  const nextAppointment = [...appointments]
    .reverse()
    .find((a) => a.status === "scheduled" && new Date(a.start_at) >= now);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/clientes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Clientes
      </Link>

      <Card className="mb-4">
        <h1 className="text-xl font-semibold text-foreground">
          {customer.name}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Phone className="h-4 w-4" aria-hidden />
          {formatPhone(customer.phone)}
        </p>
        <div className="mt-4">
          <WhatsAppButton phone={customer.phone} label="Chamar no WhatsApp" />
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Atendimentos</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {completed.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">Total gasto</p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {formatCents(totalSpent)}
          </p>
        </Card>
      </div>

      {nextAppointment && (
        <Card className="mb-4 flex items-center gap-3 border-brand/30 bg-indigo-50/50">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <CalendarClock className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">Próximo agendamento</p>
            <p className="truncate text-sm font-semibold text-foreground">
              {formatDateTimeBR(nextAppointment.start_at, tz)}
            </p>
            <p className="truncate text-xs text-muted">
              {nextAppointment.service_name_snapshot}
            </p>
          </div>
        </Card>
      )}

      <h2 className="mb-3 text-sm font-semibold text-foreground">Histórico</h2>
      {appointments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted">
          Nenhum agendamento ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((a) => (
            <li key={a.id}>
              <Card className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {a.service_name_snapshot}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {formatDateTimeBR(a.start_at, tz)} ·{" "}
                    {formatCents(a.price_cents)}
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
