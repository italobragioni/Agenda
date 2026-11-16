import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Retorna os ids de atendimentos marcados como "fora do faturamento".
 * Resiliente: se a coluna excluded_from_revenue ainda não existir no banco
 * (migração 0023), devolve um conjunto vazio (nada é excluído).
 */
export async function excludedRevenueIds(
  supabase: SupabaseClient,
  filters: { gteStart?: string; customerId?: string } = {},
): Promise<Set<string>> {
  let q = supabase
    .from("appointments")
    .select("id")
    .eq("excluded_from_revenue", true);
  if (filters.gteStart) q = q.gte("start_at", filters.gteStart);
  if (filters.customerId) q = q.eq("customer_id", filters.customerId);

  const { data } = await q;
  return new Set((data ?? []).map((r) => r.id as string));
}
