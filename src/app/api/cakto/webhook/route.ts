import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  verifyCaktoSignature,
  verifyBodySecret,
  planFromOfferId,
  SUBSCRIPTION_PERIOD_DAYS,
} from "@/lib/cakto";
import type { PaidPlan } from "@/features/billing/plan";

export const runtime = "nodejs";

type Order = {
  id?: string;
  status?: string;
  callback?: string;
  offer?: { id?: string };
  customer?: { id?: string | number };
  subscription?: { id?: string } | null;
};

type Admin = ReturnType<typeof createAdminClient>;

const PERIOD_MS = SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/** Eventos que CONFIRMAM pagamento e liberam/estendem o acesso. */
const SUCCESS_EVENTS = new Set([
  "purchase_approved",
  "subscription_created",
  "subscription_renewed",
  "subscription_late_recovered",
  "subscription_resumed",
]);

/** Eventos que REVOGAM o acesso (dinheiro devolvido). */
const REVOKE_EVENTS = new Set(["refund", "chargeback"]);

/** Eventos que mudam o estado SEM revogar o período já pago. */
const STATUS_ONLY: Record<string, string> = {
  subscription_canceled: "canceled",
  subscription_paused: "paused",
  subscription_late: "late",
  subscription_renewal_refused: "late",
  purchase_refused: "payment_failed",
};

async function recordUnreconciled(
  admin: Admin,
  event: string,
  order: Order,
  reason: string,
) {
  await admin.from("cakto_unreconciled").insert({
    event,
    order_id: order.id ?? null,
    callback: order.callback ?? null,
    offer_id: order.offer?.id ?? null,
    reason,
    payload: order as unknown as Record<string, unknown>,
  });
}

/** Encontra o estabelecimento associado ao pedido, de forma verificável. */
async function findBusiness(
  admin: Admin,
  order: Order,
): Promise<{ businessId: string; plan: PaidPlan | null } | null> {
  // 1) Pelo token de callback (associação forte, criada por nós no checkout).
  if (order.callback) {
    const { data } = await admin
      .from("cakto_checkouts")
      .select("business_id, plan")
      .eq("token", order.callback)
      .maybeSingle();
    if (data) {
      return { businessId: data.business_id as string, plan: data.plan as PaidPlan };
    }
  }
  // 2) Renovações/eventos sem callback: pela assinatura já registrada.
  const subId = order.subscription?.id;
  if (subId) {
    const { data } = await admin
      .from("businesses")
      .select("id, plan")
      .eq("cakto_subscription_id", subId)
      .maybeSingle();
    if (data) return { businessId: data.id as string, plan: data.plan as PaidPlan };
  }
  // 3) Por fim, pelo cliente Cakto (se único).
  const custId = order.customer?.id;
  if (custId != null) {
    const { data } = await admin
      .from("businesses")
      .select("id, plan")
      .eq("cakto_customer_id", String(custId));
    if (data && data.length === 1) {
      return {
        businessId: data[0].id as string,
        plan: data[0].plan as PaidPlan,
      };
    }
  }
  return null;
}

async function applyOrder(admin: Admin, event: string, order: Order) {
  // Eventos sem efeito de acesso: ignora.
  if (
    !SUCCESS_EVENTS.has(event) &&
    !REVOKE_EVENTS.has(event) &&
    !(event in STATUS_ONLY)
  ) {
    return;
  }

  const found = await findBusiness(admin, order);
  if (!found) {
    await recordUnreconciled(admin, event, order, "conta não identificada");
    return;
  }
  const { businessId } = found;

  if (SUCCESS_EVENTS.has(event)) {
    // Plano = o da OFERTA efetivamente paga (validado no servidor). Se a oferta
    // não for reconhecida (ex.: renovação sem oferta no payload), usa o plano
    // associado no checkout/cadastro. Assim, quem paga a oferta barata recebe o
    // plano barato — não dá para liberar plano caro pagando oferta barata.
    const offerId = order.offer?.id;
    const plan = (offerId && planFromOfferId(offerId)) || found.plan;
    if (!plan) {
      await recordUnreconciled(admin, event, order, "plano indeterminado");
      return;
    }

    const now = new Date();
    const paidUntil = new Date(now.getTime() + PERIOD_MS).toISOString();
    const update: Record<string, unknown> = {
      plan,
      paid_until: paidUntil,
      // Início do ciclo = agora. A cota de agendamentos reinicia a cada
      // pagamento confirmado (primeira compra e renovações).
      current_period_start: now.toISOString(),
      subscription_status: "active",
    };
    if (order.customer?.id != null) {
      update.cakto_customer_id = String(order.customer.id);
    }
    if (order.subscription?.id) {
      update.cakto_subscription_id = order.subscription.id;
    }
    await admin.from("businesses").update(update).eq("id", businessId);
    return;
  }

  if (REVOKE_EVENTS.has(event)) {
    // Dinheiro devolvido: revoga o acesso imediatamente.
    await admin
      .from("businesses")
      .update({
        paid_until: new Date().toISOString(),
        subscription_status: event === "refund" ? "refunded" : "chargeback",
      })
      .eq("id", businessId);
    return;
  }

  // STATUS_ONLY: cancelamento/pausa/atraso NÃO encurtam o período já pago.
  await admin
    .from("businesses")
    .update({ subscription_status: STATUS_ONLY[event] })
    .eq("id", businessId);
}

export async function POST(request: Request) {
  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cakto não configurado" }, { status: 503 });
  }

  const rawBody = await request.text();

  // Autenticidade: assinatura por header (recomendado) OU segredo no corpo.
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }
  const top = parsed as { secret?: unknown; event?: unknown; data?: unknown };

  const sigOk = verifyCaktoSignature({
    rawBody,
    signatureHeader: request.headers.get("x-cakto-signature"),
    timestampHeader: request.headers.get("x-cakto-timestamp"),
    secret,
  });
  const bodyOk = verifyBodySecret(top.secret, secret);
  if (!sigOk && !bodyOk) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  const event = typeof top.event === "string" ? top.event : "";
  if (!event) return NextResponse.json({ received: true });

  // `data` pode ser um objeto (V1) ou array (V2).
  const orders: Order[] = Array.isArray(top.data)
    ? (top.data as Order[])
    : top.data
      ? [top.data as Order]
      : [];

  const admin = createAdminClient();

  try {
    for (const order of orders) {
      const orderId = order.id;
      if (!orderId) continue;

      // Idempotência: dedup por evento + id do pedido.
      const dedupId = `${event}:${orderId}`;
      const { error: dupErr } = await admin
        .from("cakto_webhook_events")
        .insert({ id: dedupId, event });
      if (dupErr) {
        // 23505 = chave duplicada → já processado, ignora.
        if ((dupErr as { code?: string }).code === "23505") continue;
        // Outro erro de banco: responde 500 para a Cakto reenviar.
        return NextResponse.json({ error: "erro ao registrar" }, { status: 500 });
      }

      await applyOrder(admin, event, order);
    }
  } catch {
    return NextResponse.json({ error: "erro ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
