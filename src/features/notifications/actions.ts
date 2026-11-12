"use server";

import { getCurrentContext } from "@/features/auth/current";
import { createAdminClient } from "@/lib/supabase/admin";

/** Guarda (ou atualiza) a inscrição de push do aparelho do dono. */
export async function savePushSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ ok: boolean }> {
  const ctx = await getCurrentContext();
  if (!ctx) return { ok: false };
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { ok: false };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      business_id: ctx.business.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "endpoint" },
  );
  return { ok: !error };
}

/** Remove a inscrição deste aparelho (quando o dono desativa). */
export async function removePushSubscription(
  endpoint: string,
): Promise<{ ok: boolean }> {
  const ctx = await getCurrentContext();
  if (!ctx) return { ok: false };
  const admin = createAdminClient();
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("business_id", ctx.business.id);
  return { ok: !error };
}
