"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/phone";
import { localToUtc } from "@/lib/datetime";
import { checkRateLimit } from "@/lib/rate-limit";
import { planState, canCreateAppointment } from "@/features/billing/plan";
import { countMonthlyAppointments } from "@/features/billing/usage";

export interface PublicBookingResult {
  ok: boolean;
  error?: string;
  booking?: {
    serviceName: string;
    startAtIso: string;
    endAtIso: string;
    priceCents: number;
    durationMinutes: number;
  };
}

function mapDbError(message: string): string {
  const table: Record<string, string> = {
    HORARIO_INDISPONIVEL: "Esse horário acabou de ser reservado. Escolha outro.",
    FECHADO: "O estabelecimento está fechado nesse dia.",
    FORA_DO_HORARIO: "Esse horário está fora do funcionamento.",
    BLOQUEADO: "Esse período não está disponível.",
    DATA_PASSADA: "Não é possível agendar no passado.",
    SERVICO_INVALIDO: "Serviço indisponível.",
    NEGOCIO_INVALIDO: "Estabelecimento inválido.",
  };
  return table[(message || "").trim()] ?? "Não foi possível concluir o agendamento.";
}

export async function createPublicBooking(input: {
  slug: string;
  serviceId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  idempotencyKey: string;
}): Promise<PublicBookingResult> {
  // Proteção leve contra abuso/duplo envio por IP.
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "desconhecido";
  if (!checkRateLimit(`booking:${ip}`, 8, 60_000)) {
    return { ok: false, error: "Muitas tentativas. Aguarde um instante." };
  }

  const name = (input.customerName || "").trim();
  const phone = normalizePhone(input.customerPhone || "");

  if (name.length < 2) return { ok: false, error: "Informe seu nome." };
  if (!phone) return { ok: false, error: "Informe um WhatsApp válido." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) {
    return { ok: false, error: "Data ou horário inválidos." };
  }

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id, timezone, plan, trial_ends_at, paid_until")
    .eq("slug", input.slug)
    .maybeSingle();
  if (!business) return { ok: false, error: "Estabelecimento não encontrado." };

  // Verifica o plano/limite do estabelecimento.
  const state = planState({
    plan: business.plan,
    trial_ends_at: business.trial_ends_at,
    paid_until: business.paid_until,
  });
  const monthlyCount = await countMonthlyAppointments(
    admin,
    business.id as string,
    business.timezone as string,
  );
  if (canCreateAppointment(state, monthlyCount)) {
    return {
      ok: false,
      error: "Agendamentos indisponíveis no momento. Fale com o estabelecimento.",
    };
  }

  const { data: service } = await admin
    .from("services")
    .select("name, price_cents, duration_minutes, is_active")
    .eq("id", input.serviceId)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!service || !service.is_active) {
    return { ok: false, error: "Serviço indisponível." };
  }

  const startAt = localToUtc(
    input.date,
    input.time,
    business.timezone as string,
  );

  const { data: appt, error } = await admin.rpc("create_appointment", {
    p_business_id: business.id,
    p_service_id: input.serviceId,
    p_customer_name: name,
    p_customer_phone: phone,
    p_start_at: startAt.toISOString(),
    p_booking_source: "public",
    p_price_cents: null,
    p_duration_minutes: null,
    p_notes: null,
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) return { ok: false, error: mapDbError(error.message) };

  return {
    ok: true,
    booking: {
      serviceName: service.name as string,
      startAtIso: (appt?.start_at as string) ?? startAt.toISOString(),
      endAtIso:
        (appt?.end_at as string) ??
        new Date(
          startAt.getTime() + (service.duration_minutes as number) * 60000,
        ).toISOString(),
      priceCents: (appt?.price_cents as number) ?? (service.price_cents as number),
      durationMinutes: service.duration_minutes as number,
    },
  };
}
