import { createAdminClient } from "@/lib/supabase/admin";
import { offsetDayString, WEEKDAY_LABELS } from "@/lib/datetime";
import { planState } from "@/features/billing/plan";
import type { Business, Service } from "@/types/database";

export interface PublicDay {
  date: string; // yyyy-MM-dd (fuso do estabelecimento)
  weekday: number;
  open: boolean;
}

export interface PublicBusinessData {
  business: Pick<
    Business,
    | "id"
    | "name"
    | "slug"
    | "timezone"
    | "whatsapp"
    | "phone"
    | "plan"
    | "trial_ends_at"
    | "paid_until"
  >;
  /** O estabelecimento pode receber agendamentos (plano ativo)? */
  active: boolean;
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
    .select(
      "id, name, slug, timezone, whatsapp, phone, plan, trial_ends_at, paid_until",
    )
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

  const active = planState({
    plan: business.plan,
    trial_ends_at: business.trial_ends_at,
    paid_until: business.paid_until,
  }).active;

  return {
    business: business as PublicBusinessData["business"],
    active,
    services: (services ?? []) as PublicBusinessData["services"],
    openWeekdays,
    days,
  };
}
