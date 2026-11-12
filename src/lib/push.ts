import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

const PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:contato@carvi.online";

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  if (!PUBLIC || !PRIVATE) return false;
  webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Envia uma notificação push para todos os aparelhos inscritos de um
 * estabelecimento. Silencioso se as chaves VAPID não estiverem configuradas.
 * Remove inscrições expiradas (404/410).
 */
export async function sendPushToBusiness(
  businessId: string,
  payload: PushPayload,
): Promise<void> {
  if (!ensureConfigured()) return;

  const admin = createAdminClient();
  const { data } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("business_id", businessId);

  const subs = data ?? [];
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint as string,
            keys: { p256dh: s.p256dh as string, auth: s.auth as string },
          },
          body,
        );
      } catch (err) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          // Inscrição expirada: remove.
          await admin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", s.endpoint as string);
        }
      }
    }),
  );
}
