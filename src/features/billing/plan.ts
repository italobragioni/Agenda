import type { Plan } from "@/types/database";

export const TRIAL_DAYS = 7;

export interface PlanInfo {
  id: Exclude<Plan, "trial">;
  name: string;
  priceCents: number;
  monthlyLimit: number | null; // null = ilimitado
  features: string[];
}

export const PLANS: Record<"basic" | "premium", PlanInfo> = {
  basic: {
    id: "basic",
    name: "Básico",
    priceCents: 990,
    monthlyLimit: 50,
    features: ["Até 50 agendamentos por mês", "Página pública de agendamento", "Clientes e financeiro"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceCents: 2990,
    monthlyLimit: null,
    features: ["Agendamentos ilimitados", "Página pública de agendamento", "Clientes e financeiro"],
  },
};

export interface PlanFields {
  plan: Plan;
  trial_ends_at: string | null;
  paid_until: string | null;
}

export interface PlanState {
  /** Plano em vigor tem acesso liberado? */
  active: boolean;
  kind: Plan;
  /** Limite de agendamentos no mês (null = ilimitado). */
  monthlyLimit: number | null;
  /** Fim do período (trial ou pago). */
  until: Date | null;
  /** Dias restantes (0 se expirado). */
  daysLeft: number;
  isTrial: boolean;
}

export function planState(b: PlanFields, now: Date = new Date()): PlanState {
  if (b.plan === "trial") {
    const until = b.trial_ends_at ? new Date(b.trial_ends_at) : null;
    const active = !!until && now < until;
    return {
      active,
      kind: "trial",
      monthlyLimit: null,
      until,
      daysLeft: until ? daysBetween(now, until) : 0,
      isTrial: true,
    };
  }

  const until = b.paid_until ? new Date(b.paid_until) : null;
  const active = !!until && now < until;
  const monthlyLimit = b.plan === "basic" ? PLANS.basic.monthlyLimit : null;
  return {
    active,
    kind: b.plan,
    monthlyLimit,
    until,
    daysLeft: until ? daysBetween(now, until) : 0,
    isTrial: false,
  };
}

/**
 * Acesso aos recursos avançados (ex.: gestão financeira completa):
 * disponível no teste grátis (ativo) e no plano Premium (ativo).
 */
export function hasProAccess(b: PlanFields, now: Date = new Date()): boolean {
  const s = planState(b, now);
  return s.active && (s.isTrial || s.kind === "premium");
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}

/**
 * Decide se é possível criar um novo agendamento.
 * Retorna null se permitido, ou um código de erro.
 */
export function canCreateAppointment(
  state: PlanState,
  monthlyCount: number,
): null | "PLANO_EXPIRADO" | "LIMITE_ATINGIDO" {
  if (!state.active) return "PLANO_EXPIRADO";
  if (state.monthlyLimit !== null && monthlyCount >= state.monthlyLimit) {
    return "LIMITE_ATINGIDO";
  }
  return null;
}
