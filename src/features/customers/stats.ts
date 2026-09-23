import type { Appointment } from "@/types/database";

export interface CustomerStats {
  /** Quantidade de atendimentos finalizados. */
  completedCount: number;
  /** Total gasto (soma dos finalizados), em centavos. */
  totalSpentCents: number;
  /** Data (ISO) do último atendimento finalizado, ou null. */
  lastVisitAt: string | null;
}

const EMPTY: CustomerStats = {
  completedCount: 0,
  totalSpentCents: 0,
  lastVisitAt: null,
};

/**
 * Agrupa estatísticas por cliente a partir de uma lista de agendamentos.
 * Considera apenas agendamentos finalizados (completed) para gasto/contagem.
 */
export function buildCustomerStats(
  appointments: Pick<
    Appointment,
    "customer_id" | "status" | "price_cents" | "start_at"
  >[],
): Map<string, CustomerStats> {
  const map = new Map<string, CustomerStats>();

  for (const a of appointments) {
    if (!a.customer_id || a.status !== "completed") continue;

    const current = map.get(a.customer_id) ?? { ...EMPTY };
    current.completedCount += 1;
    current.totalSpentCents += a.price_cents;
    if (!current.lastVisitAt || a.start_at > current.lastVisitAt) {
      current.lastVisitAt = a.start_at;
    }
    map.set(a.customer_id, current);
  }

  return map;
}

export function getStats(
  map: Map<string, CustomerStats>,
  customerId: string,
): CustomerStats {
  return map.get(customerId) ?? { ...EMPTY };
}
