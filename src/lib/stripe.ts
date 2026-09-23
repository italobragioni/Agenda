import Stripe from "stripe";

/**
 * Cliente Stripe (somente servidor). Requer STRIPE_SECRET_KEY.
 * Retorna null se o Stripe ainda não estiver configurado, para que a
 * aplicação continue funcionando sem cobrança durante a configuração.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** Mapeia o id do plano para o Price ID configurado no Stripe. */
export function priceIdForPlan(plan: "basic" | "premium"): string | undefined {
  return plan === "basic"
    ? process.env.STRIPE_PRICE_BASIC
    : process.env.STRIPE_PRICE_PREMIUM;
}
