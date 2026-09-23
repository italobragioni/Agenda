import { monthStartUtc } from "@/features/financials/finance";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Conta os agendamentos criados no mês corrente (exceto cancelados).
 * Usado para aplicar o limite do plano Básico.
 */
export async function countMonthlyAppointments(
  client: SupabaseClient,
  businessId: string,
  tz: string,
): Promise<number> {
  const start = monthStartUtc(tz);
  const { count } = await client
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .neq("status", "cancelled")
    .gte("created_at", start.toISOString());
  return count ?? 0;
}
