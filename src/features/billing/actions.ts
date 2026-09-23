"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import { getStripe, priceIdForPlan } from "@/lib/stripe";

export interface CheckoutResult {
  url?: string;
  error?: string;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Cria uma sessão de checkout do Stripe para assinar um plano.
 * Retorna a URL para redirecionar o cliente.
 */
export async function createCheckoutSession(
  plan: "basic" | "premium",
): Promise<CheckoutResult> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const stripe = getStripe();
  const priceId = priceIdForPlan(plan);
  if (!stripe || !priceId) {
    return { error: "Pagamento ainda não configurado. Tente novamente em breve." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Reaproveita o cliente Stripe já criado, se houver.
  let customerId = ctx.business.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? undefined,
      name: ctx.business.name,
      metadata: { business_id: ctx.business.id },
    });
    customerId = customer.id;
    const admin = createAdminClient();
    await admin
      .from("businesses")
      .update({ stripe_customer_id: customerId })
      .eq("id", ctx.business.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: ctx.business.id,
    metadata: { business_id: ctx.business.id, plan },
    subscription_data: { metadata: { business_id: ctx.business.id, plan } },
    success_url: `${siteUrl()}/assinatura?sucesso=1`,
    cancel_url: `${siteUrl()}/assinatura?cancelado=1`,
    locale: "pt-BR",
  });

  return { url: session.url ?? undefined };
}

/** Abre o portal de gerenciamento da assinatura (Stripe Billing Portal). */
export async function createPortalSession(): Promise<CheckoutResult> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const stripe = getStripe();
  if (!stripe || !ctx.business.stripe_customer_id) {
    return { error: "Nenhuma assinatura ativa encontrada." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: ctx.business.stripe_customer_id,
    return_url: `${siteUrl()}/assinatura`,
  });

  return { url: session.url ?? undefined };
}
