import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  ShieldCheck,
  Gift,
  CalendarCheck,
  TrendingUp,
  Lock,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { PlanCards } from "@/features/billing/plan-cards";
import { planState, planLabel } from "@/features/billing/plan";
import { formatDateBR } from "@/lib/datetime";
import { SUPPORT_WHATSAPP_URL } from "@/lib/support";
import { TrackCompleteRegistration } from "@/components/analytics/track-complete-registration";

export const metadata: Metadata = { title: "Assinatura — Carvi" };

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const { novo } = await searchParams;
  const state = planState(ctx.business);
  const status = ctx.business.subscription_status;

  // Texto do estado atual.
  let title: string;
  let detail: string;
  let tone: "ok" | "warn" | "danger";
  if (state.active) {
    title = `Plano ${planLabel(state.kind)} ativo`;
    tone = "ok";
    if (status === "canceled") {
      detail = state.until
        ? `Renovação cancelada. Acesso até ${formatDateBR(state.until.toISOString(), tz)}.`
        : "Renovação cancelada.";
      tone = "warn";
    } else if (status === "late") {
      detail = state.until
        ? `Pagamento em atraso. Acesso garantido até ${formatDateBR(state.until.toISOString(), tz)}.`
        : "Pagamento em atraso.";
      tone = "warn";
    } else {
      detail = state.until
        ? `Válido até ${formatDateBR(state.until.toISOString(), tz)}.`
        : "Assinatura ativa.";
    }
  } else {
    tone = "danger";
    if (status === "refunded") {
      title = "Pagamento reembolsado";
      detail = "Sua assinatura foi reembolsada. Escolha um plano para reativar.";
    } else if (status === "chargeback") {
      title = "Pagamento contestado";
      detail = "Houve uma contestação de pagamento. Escolha um plano para reativar.";
    } else {
      title = "Sem assinatura ativa";
      detail = "Escolha um plano abaixo para liberar o acesso.";
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {novo === "1" && <TrackCompleteRegistration />}

      <PageHeader title="Assinatura" description="Escolha o plano ideal." />

      {/* Card de benefícios (só para quem ainda não assinou) */}
      {!state.active && (
        <Card className="border-brand/20 bg-brand-soft/60">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Sua agenda cheia e seu faturamento maior começam hoje
          </h2>
          <p className="mt-1 text-sm text-muted">
            Ao assinar a Carvi, você leva:
          </p>

          <ul className="mt-4 space-y-3">
            {[
              {
                icon: CalendarCheck,
                title: "Agenda organizada e agendamento online 24h",
                desc: "Seu cliente marca sozinho pelo link, a qualquer hora.",
              },
              {
                icon: TrendingUp,
                title: "Controle de faturamento e dos seus serviços",
                desc: "Acompanhe quanto entra e o que mais vende.",
              },
              {
                icon: MessageCircle,
                title: "Configuração completa com nossa ajuda no WhatsApp",
                desc: "A gente te ajuda a deixar tudo pronto pra usar.",
              },
              {
                icon: Gift,
                title: "Bônus: Plano para Aumentar o Faturamento",
                desc: "Material exclusivo liberado assim que você assina.",
              },
              {
                icon: ShieldCheck,
                title: "7 dias de garantia, sem risco",
                desc: "Não gostou? Devolvemos 100% do valor.",
              },
            ].map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                  <b.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {b.title}
                  </p>
                  <p className="text-xs text-muted">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <a href="#planos" className="mt-5 block">
            <button
              type="button"
              className="tap flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
            >
              Quero assinar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </a>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Pagamento 100% seguro
            </span>
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Cancele quando
              quiser
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden /> Suporte via
              WhatsApp
            </span>
          </div>
        </Card>
      )}

      {/* Status atual */}
      <Card
        className={
          tone === "ok"
            ? "flex items-center gap-3 border-brand/30 bg-brand-soft"
            : tone === "warn"
              ? "flex items-center gap-3 border-amber-200 bg-amber-50"
              : "flex items-center gap-3 border-red-200 bg-red-50"
        }
      >
        <span
          className={
            tone === "ok"
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground"
              : tone === "warn"
                ? "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white"
                : "flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white"
          }
        >
          {tone === "ok" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted">{detail}</p>
        </div>
      </Card>

      <div id="planos" className="scroll-mt-4">
        <PlanCards currentPlan={state.active ? state.kind : ""} />
      </div>

      <p className="text-center text-xs text-muted">
        Pagamento processado pela Cakto (cartão ou Pix). O acesso é liberado
        automaticamente após a confirmação do pagamento.
      </p>

      {/* Acompanhar pagamento / cancelamento */}
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/assinatura/status"
          className="text-sm font-medium text-brand hover:underline"
        >
          Acompanhar status do pagamento
        </Link>
        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
        >
          <MessageCircle className="h-3.5 w-3.5 text-green-600" />
          Para cancelar a renovação, fale com o suporte
        </a>
      </div>
    </div>
  );
}
