import Link from "next/link";
import { CreditCard, ChevronRight } from "lucide-react";
import { planState, PLANS, type PlanFields } from "./plan";
import { cn } from "@/lib/utils";

function daysLabel(n: number): string {
  if (n <= 0) return "termina hoje";
  if (n === 1) return "1 dia restante";
  return `${n} dias restantes`;
}

interface StatusText {
  title: string;
  detail: string;
  tone: "brand" | "warn" | "danger";
}

/** Texto e tom do status do plano (teste, pago ou expirado). */
export function planStatusText(business: PlanFields): StatusText {
  const state = planState(business);

  if (!state.active) {
    return {
      title: "Acesso expirado",
      detail: "Assine para continuar",
      tone: "danger",
    };
  }
  if (state.isTrial) {
    return {
      title: "Teste grátis",
      detail: daysLabel(state.daysLeft),
      tone: state.daysLeft <= 3 ? "warn" : "brand",
    };
  }
  const name = state.kind === "basic" ? PLANS.basic.name : PLANS.premium.name;
  return {
    title: `Plano ${name}`,
    detail: daysLabel(state.daysLeft),
    tone: state.daysLeft <= 3 ? "warn" : "brand",
  };
}

const toneClasses: Record<StatusText["tone"], string> = {
  brand: "border-brand/30 bg-brand-soft",
  warn: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

const dotClasses: Record<StatusText["tone"], string> = {
  brand: "bg-brand",
  warn: "bg-amber-500",
  danger: "bg-red-500",
};

/** Cartão clicável com o status do plano (leva para a tela de Assinatura). */
export function PlanStatusCard({
  business,
  className,
}: {
  business: PlanFields;
  className?: string;
}) {
  const s = planStatusText(business);
  return (
    <Link
      href="/assinatura"
      className={cn(
        "tap flex items-center gap-3 rounded-2xl border px-4 py-3",
        toneClasses[s.tone],
        className,
      )}
    >
      <CreditCard className="h-5 w-5 shrink-0 text-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {s.title}
        </p>
        <p className="truncate text-xs text-muted">{s.detail}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
    </Link>
  );
}

/** Versão compacta (para a barra lateral). */
export function PlanStatusChip({ business }: { business: PlanFields }) {
  const s = planStatusText(business);
  return (
    <Link
      href="/assinatura"
      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-slate-100"
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClasses[s.tone])} />
      <span className="min-w-0 flex-1 truncate text-foreground">
        {s.title}
      </span>
      <span className="shrink-0 text-muted">{s.detail}</span>
    </Link>
  );
}
