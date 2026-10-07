import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { planState, planLabel, PLANS } from "@/features/billing/plan";
import { StatusAutoRefresh } from "@/features/billing/status-auto-refresh";
import { TrackSubscribe } from "@/components/analytics/track-subscribe";

export const metadata: Metadata = { title: "Status do pagamento — Carvi" };

const FAILED = new Set(["refunded", "chargeback", "payment_failed"]);

export default async function StatusPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const state = planState(ctx.business);
  const status = ctx.business.subscription_status;

  // Pagamento confirmado → acesso ativo.
  if (state.active) {
    const price =
      state.kind !== "trial" ? PLANS[state.kind].priceCents : 0;
    return (
      <div className="mx-auto max-w-md text-center">
        <TrackSubscribe valueCents={price} plan={state.kind} />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Pagamento confirmado! 🎉
        </h1>
        <p className="mt-2 text-sm text-muted">
          Seu plano {planLabel(state.kind)} está ativo. Bom trabalho!
        </p>
        <Link href="/inicio" className="mt-6 inline-block">
          <Button size="lg">
            Ir para o painel
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    );
  }

  // Pagamento não concluído (recusado, reembolsado, contestado).
  if (status && FAILED.has(status)) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle className="h-9 w-9" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Pagamento não concluído
        </h1>
        <p className="mt-2 text-sm text-muted">
          Não recebemos a confirmação do pagamento. Você pode tentar de novo
          com a mesma conta.
        </p>
        <Link href="/assinatura" className="mt-6 inline-block">
          <Button size="lg">Escolher plano</Button>
        </Link>
      </div>
    );
  }

  // Aguardando confirmação (padrão).
  return (
    <div className="mx-auto max-w-md">
      <StatusAutoRefresh />
      <PageHeader title="Status do pagamento" />
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Clock className="h-9 w-9" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Aguardando confirmação
        </h2>
        <p className="mt-2 text-sm text-muted">
          Assim que o pagamento for confirmado, seu acesso é liberado
          automaticamente — esta tela atualiza sozinha. Você pode fechar a
          página sem problema: a confirmação continua funcionando.
        </p>
        <Link href="/assinatura" className="mt-5 inline-block">
          <Button variant="secondary">Voltar aos planos</Button>
        </Link>
      </Card>
    </div>
  );
}
