import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { planState } from "@/features/billing/plan";
import { isAdminEmail } from "@/features/admin/config";

/**
 * Exige que o estabelecimento tenha assinatura ativa para acessar funções
 * pagas. Sem pagamento confirmado, encaminha para a tela de planos.
 * Admin da Carvi é exceção (acesso legítimo).
 */
export async function requireActiveBusiness() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!planState(ctx.business).active && !isAdminEmail(ctx.email)) {
    redirect("/assinatura");
  }
  return ctx;
}
