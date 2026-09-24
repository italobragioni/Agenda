"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import { isAdminEmail } from "./config";

const FAR_FUTURE = "2099-12-31T00:00:00Z";

async function requireAdmin() {
  const ctx = await getCurrentContext();
  if (!ctx || !isAdminEmail(ctx.email)) {
    throw new Error("acesso negado");
  }
}

/** Libera Premium de cortesia (sem expiração) para um estabelecimento. */
export async function grantPremium(businessId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("businesses")
    .update({ plan: "premium", paid_until: FAR_FUTURE })
    .eq("id", businessId);
  revalidatePath("/admin");
}

/** Estende (ou reinicia) o teste grátis por 7 dias a partir de agora. */
export async function restartTrial(businessId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await admin
    .from("businesses")
    .update({ plan: "trial", trial_ends_at: trialEnds, paid_until: null })
    .eq("id", businessId);
  revalidatePath("/admin");
}
