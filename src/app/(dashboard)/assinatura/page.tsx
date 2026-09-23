import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { PlanCards } from "@/features/billing/plan-cards";
import { ManageSubscriptionButton } from "@/features/billing/manage-button";
import { planState, PLANS } from "@/features/billing/plan";
import { formatDateBR } from "@/lib/datetime";

export const metadata: Metadata = { title: "Assinatura — Agenda" };

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string; cancelado?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const { sucesso, cancelado } = await searchParams;
  const state = planState(ctx.business);

  const planLabel =
    state.kind === "trial"
      ? "Teste grátis"
      : state.kind === "basic"
        ? PLANS.basic.name
        : PLANS.premium.name;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Assinatura" description="Escolha o plano ideal." />

      {sucesso && (
        <Alert tone="success">
          Assinatura confirmada! Pode levar alguns segundos para atualizar.
        </Alert>
      )}
      {cancelado && (
        <Alert tone="info">Pagamento cancelado. Você pode tentar de novo.</Alert>
      )}

      {/* Status atual */}
      <Card
        className={
          state.active
            ? "flex items-center gap-3 border-brand/30 bg-brand-soft"
            : "flex items-center gap-3 border-red-200 bg-red-50"
        }
      >
        <span
          className={
            state.active
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground"
              : "flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white"
          }
        >
          {state.active ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {state.active ? `Plano atual: ${planLabel}` : "Acesso expirado"}
          </p>
          <p className="text-xs text-muted">
            {state.isTrial && state.active
              ? `Teste grátis: ${state.daysLeft} ${state.daysLeft === 1 ? "dia restante" : "dias restantes"}`
              : state.active && state.until
                ? `Válido até ${formatDateBR(state.until.toISOString(), tz)}`
                : "Assine um plano para continuar usando o sistema."}
          </p>
        </div>
      </Card>

      <PlanCards currentPlan={state.kind} />

      {ctx.business.stripe_customer_id && (
        <div>
          <ManageSubscriptionButton />
        </div>
      )}

      <p className="text-center text-xs text-muted">
        Pagamento seguro processado pelo Stripe. Cancele quando quiser.
      </p>
    </div>
  );
}
