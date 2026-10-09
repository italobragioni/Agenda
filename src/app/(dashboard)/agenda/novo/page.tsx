import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { requireActiveBusiness } from "@/features/billing/guard";
import { getUsage } from "@/features/billing/usage";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewAppointmentForm } from "@/features/appointments/new-appointment-form";
import { localDayString } from "@/lib/datetime";
import type { Service } from "@/types/database";

export const metadata: Metadata = { title: "Novo agendamento — Agenda" };

export default async function NovoAgendamentoPage() {
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");

  const supabase = await createClient();

  // Limite do ciclo atingido? Bloqueia a criação (mensagem + Ver planos).
  const usage = await getUsage(supabase, ctx.business, ctx.business.timezone);
  if (usage.reachedLimit) {
    return (
      <div className="mx-auto max-w-lg">
        <PageHeader title="Novo agendamento" />
        <Card className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-4 text-sm text-foreground">
            Você atingiu o limite de agendamentos do seu plano neste ciclo. Faça
            upgrade para continuar recebendo novos agendamentos.
          </p>
          <Link href="/assinatura" className="mt-5 inline-block">
            <Button>Ver planos</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
