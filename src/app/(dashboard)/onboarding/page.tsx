import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Wrench, Clock, LinkIcon, ArrowRight } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { planState } from "@/features/billing/plan";
import { Gift } from "lucide-react";

export const metadata: Metadata = { title: "Bem-vindo — Agenda" };

const STEPS = [
  {
    icon: Wrench,
    title: "1. Cadastre seus serviços",
    description: "Nome, preço e duração de cada serviço.",
    href: "/servicos/novo",
    cta: "Cadastrar serviço",
  },
  {
    icon: Clock,
    title: "2. Defina seus horários",
    description: "Dias e horários de funcionamento.",
    href: "/configuracoes",
    cta: "Configurar horários",
  },
  {
    icon: LinkIcon,
    title: "3. Compartilhe seu link",
    description: "Envie o link para seus clientes agendarem sozinhos.",
    href: "/configuracoes",
    cta: "Ver meu link",
  },
];

export default async function OnboardingPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const state = planState(ctx.business);
  const trialDays = state.isTrial ? state.daysLeft : 0;

  return (
    <div className="mx-auto max-w-lg">
      {state.isTrial && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Gift className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Você ganhou 7 dias grátis! 🎉
            </p>
            <p className="text-xs text-muted">
              Aproveite todos os recursos.{" "}
              {trialDays > 0
                ? `Seu teste termina em ${trialDays} ${trialDays === 1 ? "dia" : "dias"}.`
                : "Seu teste termina hoje."}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Vamos configurar sua agenda 🎉
        </h1>
        <p className="mt-1 text-muted">Três passos rápidos para começar.</p>
      </div>

      <div className="space-y-3">
        {STEPS.map((s) => (
          <Card key={s.title} className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <s.icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{s.title}</p>
              <p className="text-xs text-muted">{s.description}</p>
            </div>
            <Link href={s.href}>
              <Button size="sm" variant="secondary">
                {s.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link href="/inicio">
          <Button>
            Ir para minha agenda
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </div>
  );
}
