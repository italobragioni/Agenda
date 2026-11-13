"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/phone";
import { localToUtc, formatDateBR, formatTimeBR } from "@/lib/datetime";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPushToBusiness } from "@/lib/push";
import { capabilitiesFor } from "@/features/billing/plan";
import { isVehicleType, vehiclePriceCents } from "./vehicle";

/** Mensagem neutra para o cliente final (sem expor dados da assinatura). */
const UNAVAILABLE =
  "Novos agendamentos online estão temporariamente indisponíveis. Entre em contato com o estabelecimento.";

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
    // Limite do plano / assinatura inativa: mensagem neutra, sem expor nada.
    LIMITE_ATINGIDO: UNAVAILABLE,
    PLANO_EXPIRADO: UNAVAILABLE,
    HORARIO_INDISPONIVEL: "Esse horário acabou de ser reservado. Escolha outro.",
    ALMOCO: "Esse horário é o intervalo de almoço do estabelecimento.",
    HORARIO_FIXO: "Escolha um dos horários disponíveis.",
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
  serviceIds: string[];
  vehicle?: string;
  car?: string;
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
  const car = (input.car || "").trim();

  if (name.length < 2) return { ok: false, error: "Informe seu nome." };
  if (!phone) return { ok: false, error: "Informe um WhatsApp válido." };
  if (car.length < 2) return { ok: false, error: "Informe o seu carro." };
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

  // O limite do plano/ciclo e a validade da assinatura são impostos de forma
  // atômica dentro de create_appointment (RPC). O erro volta como mensagem
  // neutra para o cliente final (ver mapDbError).

  // Serviços escolhidos (um ou mais), mantendo a ordem da seleção.
  const serviceIds = (input.serviceIds ?? []).filter(Boolean);
  if (serviceIds.length === 0) {
    return { ok: false, error: "Escolha pelo menos um serviço." };
  }
  const { data: svcRows } = await admin
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .in("id", serviceIds);
  const byId = new Map((svcRows ?? []).map((s) => [s.id as string, s]));
  const services = serviceIds
    .map((sid) => byId.get(sid))
    .filter((s): s is NonNullable<typeof s> => !!s && s.is_active === true);
  if (services.length !== serviceIds.length || services.length === 0) {
    return { ok: false, error: "Serviço indisponível." };
  }

  const startAt = localToUtc(
    input.date,
    input.time,
    business.timezone as string,
  );

  // Carro (texto do cliente) + tipo/porte (validado) viram observação.
  const vTrim = (input.vehicle || "").trim();
  const vehicle = isVehicleType(vTrim) ? vTrim : null;
  const noteParts: string[] = [];
  if (car) noteParts.push(`Carro: ${car}`);
  if (vehicle) noteParts.push(`Porte: ${vehicle}`);
  const notes = noteParts.length ? noteParts.join(" · ") : null;

  // Preço por porte só nos planos Premium+; senão, usa o preço base.
  const caps = capabilitiesFor({
    plan: business.plan,
    trial_ends_at: business.trial_ends_at,
    paid_until: business.paid_until,
  });

  // Nome, duração e preço combinados (somados) dos serviços escolhidos.
  const combinedName = services.map((s) => s.name as string).join(" + ");
  const totalDuration = services.reduce(
    (sum, s) => sum + (s.duration_minutes as number),
    0,
  );
  const totalPrice = services.reduce((sum, s) => {
    const p = caps.vehiclePricing
      ? vehiclePriceCents(
          {
            price_cents: s.price_cents as number,
            price_moto_pequena_cents:
              s.price_moto_pequena_cents as number | null,
            price_moto_grande_cents:
              s.price_moto_grande_cents as number | null,
            price_hatch_cents: s.price_hatch_cents as number | null,
            price_sedan_cents: s.price_sedan_cents as number | null,
            price_suv_cents: s.price_suv_cents as number | null,
            price_caminhonete_cents:
              s.price_caminhonete_cents as number | null,
          },
          vehicle,
        )
      : (s.price_cents as number);
    return sum + p;
  }, 0);

  // Cria UM agendamento com nome/duração/preço combinados.
  // p_service_name só existe após a migração 0022; sem ela, refaz sem o nome
  // combinado (o agendamento usa o nome do primeiro serviço).
  const rpcArgs: Record<string, unknown> = {
    p_business_id: business.id,
    p_service_id: services[0].id,
    p_customer_name: name,
    p_customer_phone: phone,
    p_start_at: startAt.toISOString(),
    p_booking_source: "public",
    p_price_cents: totalPrice,
    p_duration_minutes: totalDuration,
    p_notes: notes,
    p_idempotency_key: input.idempotencyKey,
  };
  let { data: appt, error } = await admin.rpc("create_appointment", {
    ...rpcArgs,
    p_service_name: combinedName,
  });
  if (
    error &&
    (error.code === "PGRST202" ||
      /p_service_name|could not find the function/i.test(error.message))
  ) {
    ({ data: appt, error } = await admin.rpc("create_appointment", rpcArgs));
  }

  if (error) return { ok: false, error: mapDbError(error.message) };

  // Guarda o carro no cadastro do cliente (melhor esforço; ignora se a coluna
  // "vehicle" ainda não existir no banco).
  if (car) {
    await admin
      .from("customers")
      .update({ vehicle: car })
      .eq("business_id", business.id)
      .eq("phone", phone);
  }

  // Notificação push para o dono (silencioso se não houver aparelhos/chaves).
  try {
    const tzName = business.timezone as string;
    await sendPushToBusiness(business.id as string, {
      title: "Novo agendamento!",
      body: `${name} — ${combinedName} — ${formatDateBR(
        startAt,
        tzName,
      )} às ${formatTimeBR(startAt, tzName)}`,
      url: "/agenda",
      tag: `appt-${(appt?.id as string) ?? input.idempotencyKey}`,
    });
  } catch {
    // Nunca quebra o agendamento por causa da notificação.
  }

  return {
    ok: true,
    booking: {
      serviceName: combinedName,
      startAtIso: (appt?.start_at as string) ?? startAt.toISOString(),
      endAtIso:
        (appt?.end_at as string) ??
        new Date(startAt.getTime() + totalDuration * 60000).toISOString(),
      priceCents: (appt?.price_cents as number) ?? totalPrice,
      durationMinutes: totalDuration,
    },
  };
}
