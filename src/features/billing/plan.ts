import type { Plan } from "@/types/database";

export const TRIAL_DAYS = 7;

/** Planos pagos (exclui o teste grátis). */
export type PaidPlan = "basic" | "premium" | "empresarial";

export interface PlanInfo {
  id: PaidPlan;
  name: string;
  priceCents: number;
  monthlyLimit: number | null; // null = ilimitado
  features: string[];
}

export const PLANS: Record<PaidPlan, PlanInfo> = {
  basic: {
    id: "basic",
    name: "Essencial",
    priceCents: 1990,
    monthlyLimit: 50,
    features: [
      "Até 50 agendamentos por mês",
      "Página pública de agendamento",
      "Agenda, clientes e serviços",
      "Faturamento (total e por serviço)",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceCents: 4990,
    monthlyLimit: null,
    features: [
      "Agendamentos ilimitados",
      "Vários boxes (carros ao mesmo tempo)",
      "Preço por porte de veículo",
      "Logo e endereço na página",
      "Despesas e lucro",
    ],
  },
  empresarial: {
    id: "empresarial",
    name: "Empresarial",
    priceCents: 9990,
    monthlyLimit: null,
    features: [
      "Tudo do Premium",
      "Vários usuários (equipe)",
      "Exportação em planilha e relatórios",
      "Suporte dedicado",
    ],
  },
};

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
      // O teste grátis tem a experiência do plano Essencial (50/mês).
      monthlyLimit: PLANS.basic.monthlyLimit,
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

/** Nome amigável de um plano (inclui o teste grátis). */
export function planLabel(kind: Plan): string {
  if (kind === "trial") return "Teste grátis";
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
  if (!s.active) return NO_CAPS;
  const key: PaidPlan = s.kind === "trial" ? "basic" : s.kind;
  return CAPS[key];
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
