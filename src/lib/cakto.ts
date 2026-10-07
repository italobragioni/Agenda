import crypto from "node:crypto";
import type { PaidPlan } from "@/features/billing/plan";

/**
 * Integração com a Cakto (somente servidor).
 *
 * Checkout hospedado: https://pay.cakto.com.br/{ID_DA_OFERTA}?callback=<token>
 * O `callback` é um token opaco gerado por nós; ele volta no webhook em
 * `data.callback`, permitindo associar o pagamento ao estabelecimento certo
 * de forma verificável no servidor.
 *
 * Nenhum segredo é enviado ao navegador: o link de checkout contém apenas o
 * id da oferta (público) e o token opaco.
 */

const CHECKOUT_BASE = "https://pay.cakto.com.br";

/** Id da oferta (Cakto) configurado para cada plano. */
export function offerIdForPlan(plan: PaidPlan): string | undefined {
  const map: Record<PaidPlan, string | undefined> = {
    basic: process.env.CAKTO_OFFER_BASIC,
    premium: process.env.CAKTO_OFFER_PREMIUM,
    empresarial: process.env.CAKTO_OFFER_EMPRESARIAL,
  };
  return map[plan]?.trim() || undefined;
}

/** Descobre o plano a partir do id da oferta recebido no webhook. */
export function planFromOfferId(offerId: string): PaidPlan | null {
  const id = (offerId || "").trim();
  if (!id) return null;
  if (id === process.env.CAKTO_OFFER_BASIC?.trim()) return "basic";
  if (id === process.env.CAKTO_OFFER_PREMIUM?.trim()) return "premium";
  if (id === process.env.CAKTO_OFFER_EMPRESARIAL?.trim()) return "empresarial";
  return null;
}

/** Monta a URL do checkout hospedado para uma oferta, com o token de callback. */
export function checkoutUrl(offerId: string, callbackToken: string): string {
  return `${CHECKOUT_BASE}/${encodeURIComponent(offerId)}?callback=${encodeURIComponent(callbackToken)}`;
}

/**
 * Verifica a autenticidade do webhook (mecanismo recomendado pela Cakto):
 *   X-Cakto-Signature: v1=<hmac-sha256>
 *   X-Cakto-Timestamp: <unix em segundos>
 * HMAC-SHA256 com o `secret` como chave, sobre "{timestamp}.{corpo cru}".
 * Rejeita timestamps fora da janela de tolerância (5 min).
 */
export function verifyCaktoSignature(params: {
  rawBody: string;
  signatureHeader: string | null;
  timestampHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
}): boolean {
  const { rawBody, signatureHeader, timestampHeader, secret } = params;
  const tolerance = params.toleranceSeconds ?? 300;
  if (!signatureHeader || !timestampHeader) return false;

  const ts = Number(timestampHeader);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > tolerance) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestampHeader}.${rawBody}`)
    .digest("hex");
  const expectedHeader = `v1=${expected}`;

  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expectedHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Verificação alternativa (menos segura): o corpo traz um campo `secret` que
 * deve bater com o segredo configurado. Usada como reforço quando os headers
 * de assinatura não vierem.
 */
export function verifyBodySecret(
  bodySecret: unknown,
  secret: string,
): boolean {
  if (typeof bodySecret !== "string" || !bodySecret || !secret) return false;
  const a = Buffer.from(bodySecret);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Dias de cada período (planos mensais). */
export const SUBSCRIPTION_PERIOD_DAYS = 31;
