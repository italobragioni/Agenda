import { createAdminClient } from "@/lib/supabase/admin";
import type { PaidPlan } from "@/features/billing/plan";

type Admin = ReturnType<typeof createAdminClient>;

/**
 * Ativação automática por e-mail (vendas por afiliado / checkout externo da
 * Cakto, em que a pessoa paga ANTES de ter conta no app).
 *
 * Tudo resiliente: se a tabela/função ainda não existir no banco, as funções
 * apenas não fazem nada (nunca quebram cadastro, login ou o webhook).
 */

/** Acha o estabelecimento de um e-mail (via função no banco). null se não achar. */
export async function findBusinessIdByEmail(
  admin: Admin,
  email: string,
): Promise<string | null> {
  try {
    const { data, error } = await admin.rpc("find_business_by_email", {
      p_email: email,
    });
    if (error) return null;
    return (data as string | null) ?? null;
  } catch {
    return null;
  }
}

/** Guarda um pagamento sem conta (pendente), para ativar quando a pessoa entrar. */
export async function storePendingActivation(
  admin: Admin,
  input: {
    email: string;
    plan: PaidPlan;
    paidUntil: string;
    currentPeriodStart: string;
    caktoCustomerId?: string | null;
    caktoSubscriptionId?: string | null;
  },
): Promise<void> {
  try {
    await admin.from("pending_activations").upsert(
      {
        email: input.email.trim().toLowerCase(),
        plan: input.plan,
        paid_until: input.paidUntil,
        current_period_start: input.currentPeriodStart,
        cakto_customer_id: input.caktoCustomerId ?? null,
        cakto_subscription_id: input.caktoSubscriptionId ?? null,
        subscription_status: "active",
        consumed_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );
  } catch {
    // tabela ausente / erro: ignora
  }
}

/**
 * Se houver um pagamento pendente para o e-mail, aplica ao estabelecimento e
 * marca como consumido. Retorna true se ativou algo.
 */
export async function consumePendingForEmail(
  admin: Admin,
  email: string,
  businessId: string,
): Promise<boolean> {
  try {
    const key = email.trim().toLowerCase();
    const { data } = await admin
      .from("pending_activations")
      .select("*")
      .eq("email", key)
      .maybeSingle();
    if (!data || data.consumed_at) return false;

    await admin
      .from("businesses")
      .update({
        plan: data.plan,
        paid_until: data.paid_until,
        current_period_start: data.current_period_start,
        cakto_customer_id: data.cakto_customer_id,
        cakto_subscription_id: data.cakto_subscription_id,
        subscription_status: data.subscription_status ?? "active",
      })
      .eq("id", businessId);

    await admin
      .from("pending_activations")
      .update({
        consumed_at: new Date().toISOString(),
        business_id: businessId,
      })
      .eq("email", key);

    return true;
  } catch {
    return false;
  }
}
