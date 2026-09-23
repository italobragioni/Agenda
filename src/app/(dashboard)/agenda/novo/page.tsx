import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { NewAppointmentForm } from "@/features/appointments/new-appointment-form";
import { localDayString } from "@/lib/datetime";
import type { Service } from "@/types/database";

export const metadata: Metadata = { title: "Novo agendamento — Agenda" };

export default async function NovoAgendamentoPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("id, name, price_cents, duration_minutes")
    .eq("is_active", true)
    .order("name");

  const services = (data ?? []) as Pick<
    Service,
    "id" | "name" | "price_cents" | "duration_minutes"
  >[];

  const today = localDayString(ctx.business.timezone);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Novo agendamento" />
      <Card>
        <NewAppointmentForm services={services} today={today} />
      </Card>
    </div>
  );
}
