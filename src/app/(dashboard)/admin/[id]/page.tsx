import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  CalendarClock,
  Users,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { isAdminEmail } from "@/features/admin/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonutChart, type DonutSlice } from "@/components/ui/donut-chart";
import { AdminRowActions } from "@/features/admin/row-actions";
import { planStatusText } from "@/features/billing/plan-status";
import { formatCents } from "@/lib/money";
import { formatDateBR } from "@/lib/datetime";
import { formatPhone, whatsappLink } from "@/lib/phone";
import { onboardingWhatsappMessage } from "@/lib/support";
import type { Business, Service, Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Detalhes — Carvi" };

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!isAdminEmail(ctx.email)) notFound();

  const admin = createAdminClient();
  const tz = ctx.business.timezone;

  const { data: businessData } = await admin
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!businessData) notFound();
  const business = businessData as Business;

  const [
    { data: servicesData },
    { data: apptData },
    { count: customerCount },
    { data: profileData },
  ] = await Promise.all([
    admin
      .from("services")
      .select("*")
      .eq("business_id", id)
      .order("created_at", { ascending: true }),
    admin
      .from("appointments")
      .select("price_cents, service_name_snapshot, status, start_at")
      .eq("business_id", id),
    admin
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("business_id", id),
    admin.from("profiles").select("id, full_name").eq("business_id", id).maybeSingle(),
  ]);

  const services = (servicesData ?? []) as Service[];
  const appts = (apptData ?? []) as Pick<
    Appointment,
    "price_cents" | "service_name_snapshot" | "status" | "start_at"
  >[];

  // E-mail do dono.
  let ownerEmail = "—";
  if (profileData?.id) {
    const { data: userRes } = await admin.auth.admin.getUserById(profileData.id);
    if (userRes.user?.email) ownerEmail = userRes.user.email;
  }

  // Métricas (histórico completo).
  const completed = appts.filter((a) => a.status === "completed");
  const faturamento = completed.reduce((s, a) => s + a.price_cents, 0);
  const scheduled = appts.filter((a) => a.status === "scheduled").length;
  const activeServices = services.filter((s) => s.is_active).length;

  // Faturamento por serviço (para o donut).
  const byService = new Map<string, number>();
  for (const a of completed) {
    byService.set(
      a.service_name_snapshot,
      (byService.get(a.service_name_snapshot) ?? 0) + a.price_cents,
    );
  }
  const donutData: DonutSlice[] = [...byService.entries()]
    .map(([name, cents]) => ({ key: name, label: name, value: cents }))
    .sort((a, b) => b.value - a.value);

  const tel = business.whatsapp || business.phone;
  const st = planStatusText(business);

  const stats = [
    { icon: TrendingUp, label: "Faturamento", value: formatCents(faturamento) },
    { icon: CalendarClock, label: "Concluídos", value: String(completed.length) },
    { icon: Users, label: "Clientes", value: String(customerCount ?? 0) },
    { icon: Wrench, label: "Serviços ativos", value: String(activeServices) },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <PageHeader title={business.name} description={`/${business.slug}`} />

      {/* Plano + ações */}
      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge
            className={
              st.tone === "danger"
                ? "bg-red-50 text-red-700 border-red-200"
                : st.tone === "warn"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-brand-soft text-brand border-brand/30"
            }
          >
            {st.title}
          </Badge>
          <p className="mt-1 text-xs text-muted">{st.detail}</p>
        </div>
        <AdminRowActions businessId={business.id} />
      </Card>

      {/* Contato / info */}
      <Card className="mb-6 space-y-2 p-4 text-sm">
        <p className="flex items-center gap-2 text-foreground">
          <Mail className="h-4 w-4 shrink-0 text-muted" />
          {ownerEmail}
        </p>
        <p className="flex items-center gap-2 text-foreground">
          <Users className="h-4 w-4 shrink-0 text-muted" />
          {tel ? (
            <a
              href={whatsappLink(
                tel,
                onboardingWhatsappMessage(profileData?.full_name),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand hover:underline"
            >
              {formatPhone(tel)}
            </a>
          ) : (
            "Sem telefone"
          )}
        </p>
        {business.address && (
          <p className="flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-muted" />
            {business.address}
          </p>
        )}
        <p className="flex items-center gap-2 text-muted">
          <CalendarClock className="h-4 w-4 shrink-0" />
          Cadastro: {formatDateBR(business.created_at, tz)}
        </p>
      </Card>

      {/* Métricas */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-2 text-xs font-medium text-muted">{s.label}</p>
            <p className="text-lg font-semibold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>
      {scheduled > 0 && (
        <p className="mb-6 -mt-3 text-xs text-muted">
          + {scheduled} agendamento(s) futuros (ainda não concluídos).
        </p>
      )}

      {/* Faturamento por serviço */}
      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          Faturamento por serviço
        </h2>
        <DonutChart data={donutData} />
      </Card>

      {/* Lista de serviços */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Serviços cadastrados
        </h2>
        {services.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Nenhum serviço cadastrado.
          </p>
        ) : (
          <ul className="space-y-2">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="min-w-0 truncate text-foreground">
                  {s.name}
                  {!s.is_active && (
                    <span className="ml-2 text-xs text-muted">(inativo)</span>
                  )}
                </span>
                <span className="shrink-0 text-muted">
                  {s.duration_minutes} min · {formatCents(s.price_cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
