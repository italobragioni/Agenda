import type { Plan } from "@/types/database";

/** Planos pagos. */
export type PaidPlan = "basic" | "premium" | "empresarial";

export interface PlanInfo {
  id: PaidPlan;
  name: string;
  priceCents: number;
  /** Limite de agendamentos por ciclo da assinatura (null = ilimitado). */
  monthlyLimit: number | null;
  /** Máximo de boxes/atendimentos simultâneos (null = ilimitado). */
  maxBoxes: number | null;
  /** Máximo de serviços cadastrados (null = ilimitado). */
  maxServices: number | null;
  features: string[];
}

export const PLANS: Record<PaidPlan, PlanInfo> = {
  basic: {
    id: "basic",
    name: "Essencial",
    priceCents: 1990,
    monthlyLimit: 20,
    maxBoxes: 1,
    maxServices: 5,
    features: [
      "20 agendamentos por mês",
      "1 box de atendimento",
      "Até 5 serviços cadastrados",
      "Página pública de agendamento",
      "Cadastro de clientes",
      "Controle básico de faturamento",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceCents: 4990,
    monthlyLimit: 70,
    maxBoxes: 3,
    maxServices: 20,
    features: [
      "70 agendamentos por mês",
      "Até 3 boxes de atendimento",
      "Até 20 serviços cadastrados",
      "Página pública personalizada",
      "Preço por porte de veículo",
      "Faturamento, despesas e lucro",
      "1 usuário",
    ],
  },
  empresarial: {
    id: "empresarial",
    name: "Empresarial",
    priceCents: 9990,
    monthlyLimit: null,
    maxBoxes: null,
    maxServices: null,
    features: [
      "Agendamentos ilimitados",
      "Boxes ilimitados",
      "Serviços ilimitados",
      "Tudo do Premium",
      "Vários usuários (equipe)",
      "Exportação em planilha e relatórios",
      "Suporte dedicado",
    ],
  },
};

/**
 * Limite de agendamentos por ciclo do plano (regra de negócio).
 * MANTER EM SINCRONIA com a função SQL create_appointment (migração 0015).
 */
export function monthlyLimitFor(plan: Plan): number | null {
  if (plan === "basic") return PLANS.basic.monthlyLimit;
  if (plan === "premium") return PLANS.premium.monthlyLimit;
  return null; // empresarial e sem assinatura (trial) = sem cota fixa aqui
}

/** Limite de boxes do plano (null = ilimitado). */
export function maxBoxesFor(plan: Plan): number | null {
  if (plan === "basic") return PLANS.basic.maxBoxes;
  if (plan === "premium") return PLANS.premium.maxBoxes;
  return null;
}

/** Limite de serviços cadastrados do plano (null = ilimitado). */
export function maxServicesFor(plan: Plan): number | null {
  if (plan === "basic") return PLANS.basic.maxServices;
  if (plan === "premium") return PLANS.premium.maxServices;
  return null;
}

/** Recursos liberados por plano. */
export interface Capabilities {
  /** Vários carros ao mesmo tempo (capacidade > 1). */
  boxes: boolean;
  /** Preço por porte de veículo. */
  vehiclePricing: boolean;
  /** Logo e endereço/mapa na página pública. */
  branding: boolean;
  /** Despesas, lucro, lançamentos e gráfico de entradas × saídas. */
  expenses: boolean;
  /** Exportação em planilha e relatórios. */
  exports: boolean;
  /** Vários usuários (equipe). */
  team: boolean;
}

const NO_CAPS: Capabilities = {
  boxes: false,
  vehiclePricing: false,
  branding: false,
  expenses: false,
  exports: false,
  team: false,
};

const CAPS: Record<PaidPlan, Capabilities> = {
  basic: { ...NO_CAPS },
  premium: {
    boxes: true,
    vehiclePricing: true,
    branding: true,
    expenses: true,
    exports: false,
    team: false,
  },
  empresarial: {
    boxes: true,
    vehiclePricing: true,
    branding: true,
    expenses: true,
    exports: true,
    team: true,
  },
};

export interface PlanFields {
  plan: Plan;
  trial_ends_at: string | null;
  paid_until: string | null;
  /** Início do ciclo atual (gravado pelo provedor de pagamento no webhook). */
  current_period_start?: string | null;
  /** Limite de agendamentos contratado (grandfathering de assinantes antigos). */
  appointment_limit_override?: number | null;
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
  // O acesso vem exclusivamente de paid_until (pagamento confirmado).
  // Não há mais teste grátis nem liberação automática.
  const until = b.paid_until ? new Date(b.paid_until) : null;
  const active = !!until && now < until;
  // Limite contratado (override) tem prioridade; senão, o limite do plano.
  const monthlyLimit =
    b.appointment_limit_override != null
      ? b.appointment_limit_override
      : monthlyLimitFor(b.plan);
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
 * Início do ciclo vigente para contagem de agendamentos.
 * Usa a data registrada pelo provedor (current_period_start) quando disponível;
 * caso contrário, cai no início do mês do calendário (contas antigas/cortesia).
 */
export function cycleStart(
  b: PlanFields,
  monthStartFallback: Date,
  now: Date = new Date(),
): Date {
  const cps = b.current_period_start ? new Date(b.current_period_start) : null;
  if (cps && cps.getTime() <= now.getTime()) return cps;
  return monthStartFallback;
}

/** Nome amigável de um plano. */
export function planLabel(kind: Plan): string {
  if (kind === "trial") return "Sem assinatura";
  return PLANS[kind].name;
}

/**
 * Recursos liberados para o estabelecimento agora. Plano expirado = nenhum
 * recurso avançado. O teste grátis tem as capacidades do plano Essencial.
 */
export function capabilitiesFor(
  b: PlanFields,
  now: Date = new Date(),
): Capabilities {
  const s = planState(b, now);
  if (!s.active || s.kind === "trial") return NO_CAPS;
  return CAPS[s.kind];
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / (24 * 60 * 60 * 1000));
}

// A decisão de permitir/bloquear um novo agendamento (plano ativo + cota do
// ciclo) é feita de forma ATÔMICA na função do banco create_appointment
// (migração 0015). Para exibição do consumo no painel use getUsage() em
// features/billing/usage.ts.
