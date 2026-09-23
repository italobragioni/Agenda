import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Descobre o plano a partir do Price ID ou dos metadados. */
function planFromSubscription(sub: Stripe.Subscription): "basic" | "premium" {
  const metaPlan = sub.metadata?.plan;
  if (metaPlan === "basic" || metaPlan === "premium") return metaPlan;
  const priceId = sub.items.data[0]?.price.id;
  if (priceId && priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
  return "basic";
}

/** Lê o fim do período atual (posição mudou entre versões da API). */
function currentPeriodEnd(sub: Stripe.Subscription): number | null {
  const top = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  if (top) return top;
  const item = sub.items?.data?.[0] as unknown as {
    current_period_end?: number;
  };
  return item?.current_period_end ?? null;
}

/** Aplica o estado da assinatura ao estabelecimento. */
async function applySubscription(sub: Stripe.Subscription) {
  const businessId = sub.metadata?.business_id;
  if (!businessId) return;

  const admin = createAdminClient();
  const active = sub.status === "active" || sub.status === "trialing";
  const periodEnd = currentPeriodEnd(sub);
  const paidUntil = new Date(
    periodEnd ? periodEnd * 1000 : Date.now() + 31 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await admin
    .from("businesses")
    .update({
      plan: active ? planFromSubscription(sub) : "basic",
      paid_until: paidUntil,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer as string,
    })
    .eq("id", businessId);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "stripe não configurado" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "sem assinatura" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          if (!sub.metadata?.business_id && session.metadata?.business_id) {
            sub.metadata = {
              ...sub.metadata,
              business_id: session.metadata.business_id,
              plan: session.metadata.plan ?? "",
            };
          }
          await applySubscription(sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.paid": {
        // Para invoice.paid, busca a assinatura vinculada.
        let sub: Stripe.Subscription | null = null;
        if (event.type === "invoice.paid") {
          const invoice = event.data.object as Stripe.Invoice;
          const subId =
            (invoice as unknown as { subscription?: string }).subscription ??
            (
              invoice as unknown as {
                parent?: { subscription_details?: { subscription?: string } };
              }
            ).parent?.subscription_details?.subscription;
          if (subId) {
            sub = await stripe.subscriptions.retrieve(subId);
          }
        } else {
          sub = event.data.object as Stripe.Subscription;
        }
        if (sub) await applySubscription(sub);
        break;
      }
    }
  } catch {
    return NextResponse.json({ error: "erro ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
