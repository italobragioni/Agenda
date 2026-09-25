import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Building2,
  Clock,
  Timer,
  Ban,
  UserCircle,
  Image as ImageIcon,
  Boxes,
} from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { BusinessInfoForm } from "@/features/settings/business-info-form";
import { LogoForm } from "@/features/settings/logo-form";
import { HoursForm } from "@/features/settings/hours-form";
import { IntervalForm } from "@/features/settings/interval-form";
import { CapacityForm } from "@/features/settings/capacity-form";
import { BlockedTimesManager } from "@/features/settings/blocked-times-manager";
import { LogoutButton } from "@/features/auth/logout-button";
import { localDayString } from "@/lib/datetime";
import type { BusinessHours, BlockedTime } from "@/types/database";
import Link from "next/link";

export const metadata: Metadata = { title: "Configurações — Agenda" };

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-muted" aria-hidden />
        {title}
      </h2>
      <Card>{children}</Card>
    </section>
  );
}

export default async function ConfiguracoesPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: hoursData }, { data: blocksData }] = await Promise.all([
    supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", ctx.business.id),
    supabase
      .from("blocked_times")
      .select("*")
      .gte("end_at", new Date().toISOString())
      .order("start_at", { ascending: true }),
  ]);

  const hours = (hoursData ?? []) as BusinessHours[];
  const blocks = (blocksData ?? []) as BlockedTime[];
  const today = localDayString(tz);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Configurações" />

      <Section icon={Building2} title="Meu negócio">
        <BusinessInfoForm
          name={ctx.business.name}
          phone={ctx.business.phone}
          whatsapp={ctx.business.whatsapp}
          address={ctx.business.address}
        />
      </Section>

      <Section icon={ImageIcon} title="Logo do estabelecimento">
        <LogoForm logoUrl={ctx.business.logo_url} />
      </Section>

      <Section icon={Clock} title="Horários de funcionamento">
        <HoursForm hours={hours} />
      </Section>

      <Section icon={Boxes} title="Capacidade (boxes)">
        <CapacityForm value={ctx.business.capacity} />
      </Section>

      <Section icon={Timer} title="Intervalo entre clientes">
        <IntervalForm value={ctx.business.appointment_interval_minutes} />
      </Section>

      <Section icon={Ban} title="Bloqueios de horário">
        <BlockedTimesManager blocks={blocks} tz={tz} today={today} />
      </Section>

      <Section icon={UserCircle} title="Conta">
        <div className="space-y-3">
          <p className="text-sm text-muted">
            E-mail: <span className="text-foreground">{user?.email}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/esqueci-senha"
              className="text-sm font-medium text-brand hover:underline"
            >
              Alterar senha
            </Link>
          </div>
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </Section>
    </div>
  );
}
