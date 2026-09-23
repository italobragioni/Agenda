import { createAdminClient } from "@/lib/supabase/admin";
import { offsetDayString, WEEKDAY_LABELS } from "@/lib/datetime";
import type { Business, Service } from "@/types/database";

export interface PublicDay {
  date: string; // yyyy-MM-dd (fuso do estabelecimento)
  weekday: number;
  open: boolean;
}

export interface PublicBusinessData {
  business: Pick<
    Business,
    "id" | "name" | "slug" | "timezone" | "whatsapp" | "phone"
  >;
  services: Pick<
    Service,
    "id" | "name" | "description" | "price_cents" | "duration_minutes"
  >[];
  openWeekdays: number[];
  days: PublicDay[];
}

/** Rótulo curto do dia da semana (Dom, Seg, ...). */
export function weekdayShort(weekday: number): string {
  return WEEKDAY_LABELS[weekday].slice(0, 3);
}

/**
 * Carrega os dados públicos de um estabelecimento pelo slug.
 * Retorna null se o slug não existir.
 */
export async function getPublicBusiness(
  slug: string,
): Promise<PublicBusinessData | null> {
  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id, name, slug, timezone, whatsapp, phone")
    .eq("slug", slug)
    .maybeSingle();
  if (!business) return null;

  const [{ data: services }, { data: hours }] = await Promise.all([
    admin
      .from("services")
      .select("id, name, description, price_cents, duration_minutes")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("price_cents", { ascending: true }),
    admin
      .from("business_hours")
      .select("weekday, is_open")
      .eq("business_id", business.id),
  ]);

  const openWeekdays = (hours ?? [])
    .filter((h) => h.is_open)
    .map((h) => h.weekday as number);

  // Próximos 21 dias, marcando quais estão abertos.
  const tz = business.timezone as string;
  const days: PublicDay[] = [];
  for (let i = 0; i < 21; i++) {
    const date = offsetDayString(tz, i);
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    days.push({ date, weekday, open: openWeekdays.includes(weekday) });
  }

  return {
    business: business as PublicBusinessData["business"],
    services: (services ?? []) as PublicBusinessData["services"],
    openWeekdays,
    days,
  };
}
