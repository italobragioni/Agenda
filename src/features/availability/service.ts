import { createAdminClient } from "@/lib/supabase/admin";
import { computeAvailableSlots, type Interval } from "./engine";
import { rangesForDay } from "@/features/settings/hours";
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
  /** Duração total (sobrepõe a do serviço) — usada em multi-serviço. */
  durationOverride?: number;
}): Promise<string[]> {
  const { businessId, serviceId, dayStr, excludeAppointmentId, durationOverride } =
    params;
  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select(
      "timezone, appointment_interval_minutes, capacity, lunch_start, lunch_end, fixed_slot_times",
    )
    .eq("id", businessId)
    .maybeSingle();
  if (!business) return [];
  const tz = business.timezone as string;
  const intervalMin = business.appointment_interval_minutes as number;
  const capacity = Math.max(1, (business.capacity as number) ?? 1);

  const { data: service } = await admin
    .from("services")
    .select("duration_minutes, is_active")
    .eq("id", serviceId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!service || !service.is_active) return [];
  const durationMin =
    durationOverride && durationOverride > 0
      ? durationOverride
      : (service.duration_minutes as number);

  // Dia da semana da data (0 = domingo), independente de fuso.
  const weekday = new Date(`${dayStr}T00:00:00Z`).getUTCDay();

  // Lê o horário do dia. Tenta com time_ranges (vários períodos); se a coluna
  // ainda não existir no banco, cai para start_time/end_time (um período).
  let hours: {
    is_open?: boolean | null;
    start_time?: string | null;
    end_time?: string | null;
    time_ranges?: { start: string; end: string }[] | null;
  } | null = null;
  {
    const withRanges = await admin
      .from("business_hours")
      .select("is_open, start_time, end_time, time_ranges")
      .eq("business_id", businessId)
      .eq("weekday", weekday)
      .maybeSingle();
    if (withRanges.error) {
      const basic = await admin
        .from("business_hours")
        .select("is_open, start_time, end_time")
        .eq("business_id", businessId)
        .eq("weekday", weekday)
        .maybeSingle();
      hours = basic.data;
    } else {
      hours = withRanges.data;
    }
  }

  // Períodos de funcionamento do dia (um ou vários). Vazio = fechado.
  const windows = hours ? rangesForDay(hours) : [];
  if (windows.length === 0) return [];

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

  // Horário de almoço permanente: trata como um bloqueio do dia inteiro.
  const lunchStart = business.lunch_start as string | null;
  const lunchEnd = business.lunch_end as string | null;
  if (lunchStart && lunchEnd) {
    blocked.push({
      start: localToUtc(dayStr, lunchStart.slice(0, 5), tz),
      end: localToUtc(dayStr, lunchEnd.slice(0, 5), tz),
    });
  }

  // Horários fixos de marcação (ex.: só 08:00 e 13:00). Vazio = de 30 em 30.
  const fixedTimes = (business.fixed_slot_times as string[] | null) ?? [];
  const fixedStartsUtc =
    fixedTimes.length > 0
      ? fixedTimes.map((t) => localToUtc(dayStr, t.slice(0, 5), tz))
      : undefined;

  // Calcula os horários de cada período e junta tudo (sem duplicar).
  const seen = new Set<number>();
  const allSlots: Date[] = [];
  for (const w of windows) {
    const openUtc = localToUtc(dayStr, w.start, tz);
    // "24:00"/"00:00" no fim = meia-noite (fim do dia) = início + 24h.
    const closeUtc =
      w.end === "24:00" || w.end === "00:00"
        ? dayEnd
        : localToUtc(dayStr, w.end, tz);
    const slots = computeAvailableSlots({
      openUtc,
      closeUtc,
      durationMin,
      intervalMin,
      stepMin: SLOT_STEP_MIN,
      existing,
      blocked,
      now: new Date(),
      capacity,
      fixedStartsUtc,
    });
    for (const s of slots) {
      const t = s.getTime();
      if (!seen.has(t)) {
        seen.add(t);
        allSlots.push(s);
      }
    }
  }

  allSlots.sort((a, b) => a.getTime() - b.getTime());
  return allSlots.map((d) => formatInTimeZone(d, tz, "HH:mm"));
}
