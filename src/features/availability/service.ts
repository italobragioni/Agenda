import { createAdminClient } from "@/lib/supabase/admin";
import { computeAvailableSlots, type Interval } from "./engine";
import { dayRangeUtc, localToUtc } from "@/lib/datetime";
import { formatInTimeZone } from "date-fns-tz";

/** Granularidade dos horários oferecidos (em minutos). */
const SLOT_STEP_MIN = 30;

/**
 * Calcula os horários disponíveis ("HH:mm") de um serviço em um dia.
 *
 * Recebe o businessId já resolvido pelo chamador (sessão do dono ou slug
 * público) e usa o cliente admin para ler os dados necessários.
 */
export async function getAvailableSlots(params: {
  businessId: string;
  serviceId: string;
  dayStr: string; // "yyyy-MM-dd" no fuso do estabelecimento
  excludeAppointmentId?: string;
}): Promise<string[]> {
  const { businessId, serviceId, dayStr, excludeAppointmentId } = params;
  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("timezone, appointment_interval_minutes")
    .eq("id", businessId)
    .maybeSingle();
  if (!business) return [];
  const tz = business.timezone as string;
  const intervalMin = business.appointment_interval_minutes as number;

  const { data: service } = await admin
    .from("services")
    .select("duration_minutes, is_active")
    .eq("id", serviceId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!service || !service.is_active) return [];
  const durationMin = service.duration_minutes as number;

  // Dia da semana da data (0 = domingo), independente de fuso.
  const weekday = new Date(`${dayStr}T00:00:00Z`).getUTCDay();

  const { data: hours } = await admin
    .from("business_hours")
    .select("is_open, start_time, end_time")
    .eq("business_id", businessId)
    .eq("weekday", weekday)
    .maybeSingle();
  if (!hours || !hours.is_open || !hours.start_time || !hours.end_time) {
    return [];
  }

  const openUtc = localToUtc(dayStr, String(hours.start_time).slice(0, 5), tz);
  const closeUtc = localToUtc(dayStr, String(hours.end_time).slice(0, 5), tz);

  const { start: dayStart, end: dayEnd } = dayRangeUtc(dayStr, tz);

  // Agendamentos ativos que tocam o dia.
  let apptQuery = admin
    .from("appointments")
    .select("id, start_at, end_at")
    .eq("business_id", businessId)
    .in("status", ["scheduled", "in_progress"])
    .lt("start_at", dayEnd.toISOString())
    .gt("end_at", dayStart.toISOString());
  if (excludeAppointmentId) {
    apptQuery = apptQuery.neq("id", excludeAppointmentId);
  }
  const { data: appts } = await apptQuery;

  const { data: blocks } = await admin
    .from("blocked_times")
    .select("start_at, end_at")
    .eq("business_id", businessId)
    .lt("start_at", dayEnd.toISOString())
    .gt("end_at", dayStart.toISOString());

  const existing: Interval[] = (appts ?? []).map((a) => ({
    start: new Date(a.start_at as string),
    end: new Date(a.end_at as string),
  }));
  const blocked: Interval[] = (blocks ?? []).map((b) => ({
    start: new Date(b.start_at as string),
    end: new Date(b.end_at as string),
  }));

  const slots = computeAvailableSlots({
    openUtc,
    closeUtc,
    durationMin,
    intervalMin,
    stepMin: SLOT_STEP_MIN,
    existing,
    blocked,
    now: new Date(),
  });

  return slots.map((d) => formatInTimeZone(d, tz, "HH:mm"));
}
