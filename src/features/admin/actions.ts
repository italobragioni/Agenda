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

/** Libera Essencial de cortesia (sem expiração) para um estabelecimento. */
export async function grantBasic(businessId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("businesses")
    .update({ plan: "basic", paid_until: FAR_FUTURE })
    .eq("id", businessId);
  revalidatePath("/admin");
}

/** Libera Empresarial de cortesia (sem expiração) para um estabelecimento. */
export async function grantEmpresarial(businessId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("businesses")
    .update({ plan: "empresarial", paid_until: FAR_FUTURE })
    .eq("id", businessId);
  revalidatePath("/admin");
}

/** Remove o acesso (expira a assinatura) de um estabelecimento. */
export async function revokeAccess(businessId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("businesses")
    .update({ paid_until: new Date().toISOString(), subscription_status: null })
    .eq("id", businessId);
  revalidatePath("/admin");
}
