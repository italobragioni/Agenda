import { monthStartUtc } from "@/features/financials/finance";
import { cycleStart, monthlyLimitFor, type PlanFields } from "./plan";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Conta os agendamentos criados no CICLO vigente da assinatura (exceto
 * cancelados). O consumo é pela data de criação (created_at), não pela data
 * marcada do serviço — um agendamento criado em 20/10 para 15/11 consome a cota
 * do ciclo vigente em 20/10. Cancelados devolvem a unidade (ficam de fora).
 */
export async function countCycleAppointments(
  client: SupabaseClient,
  businessId: string,
  start: Date,
): Promise<number> {
  const { count } = await client
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .gte("created_at", start.toISOString());
  return count ?? 0;
}

export interface Usage {
  /** Limite do ciclo (null = ilimitado). */
  limit: number | null;
  /** Unidades consumidas no ciclo vigente. */
  used: number;
  /** true quando o plano não tem limite de agendamentos. */
  unlimited: boolean;
  /** Início do ciclo vigente. */
  cycleStart: Date;
  /** Data prevista de renovação/fim do período pago. */
  renewsAt: Date | null;
  /** Consumo já atingiu 80% (aviso discreto ao proprietário). */
  nearLimit: boolean;
  /** Limite atingido — bloquear novas criações. */
  reachedLimit: boolean;
}

/**
 * Consumo do ciclo para exibição no painel. Para planos ilimitados não faz a
 * contagem (não há cota a controlar).
 */
export async function getUsage(
  client: SupabaseClient,
  business: PlanFields & { id: string },
  tz: string,
  now: Date = new Date(),
): Promise<Usage> {
  const start = cycleStart(business, monthStartUtc(tz), now);
  const renewsAt = business.paid_until ? new Date(business.paid_until) : null;
  const limit =
    business.appointment_limit_override != null
      ? business.appointment_limit_override
      : monthlyLimitFor(business.plan);

  if (limit === null) {
    return {
      limit: null,
      used: 0,
      unlimited: true,
      cycleStart: start,
      renewsAt,
      nearLimit: false,
      reachedLimit: false,
    };
  }

  const used = await countCycleAppointments(client, business.id, start);
  return {
    limit,
    used,
    unlimited: false,
    cycleStart: start,
    renewsAt,
    nearLimit: limit > 0 && used / limit >= 0.8,
    reachedLimit: used >= limit,
  };
}
