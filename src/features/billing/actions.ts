"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { createAdminClient } from "@/lib/supabase/admin";
import { offerIdForPlan, checkoutUrl } from "@/lib/cakto";
import type { PaidPlan } from "./plan";

export interface CheckoutResult {
  url?: string;
  error?: string;
}

/**
 * Inicia o checkout de um plano na Cakto.
 * Gera um token de callback (opaco) e o guarda associado ao estabelecimento,
 * para que o webhook possa liberar a conta certa de forma verificável.
 * Não envia nenhum segredo ao navegador.
 */
export async function createCheckoutSession(
  plan: PaidPlan,
): Promise<CheckoutResult> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const offerId = offerIdForPlan(plan);
  if (!offerId) {
    return {
      error:
        "Este plano ainda não está disponível para contratação. Tente novamente em breve.",
    };
  }

  const token = crypto.randomUUID();
  const admin = createAdminClient();
  const { error } = await admin.from("cakto_checkouts").insert({
    token,
    business_id: ctx.business.id,
    plan,
  });
  if (error) {
    return { error: "Não foi possível iniciar o checkout. Tente novamente." };
  }

  return { url: checkoutUrl(offerId, token) };
}
