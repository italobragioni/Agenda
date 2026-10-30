"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { normalizePhone } from "@/lib/phone";
import { parseCurrencyToCents } from "@/lib/money";
import { localToUtc, localDayString } from "@/lib/datetime";
import { planState } from "@/features/billing/plan";
import { getUsage } from "@/features/billing/usage";
import type { ActionState } from "@/lib/forms";
import type { AppointmentStatus } from "@/types/database";

/** Traduz os erros vindos da função do banco para mensagens amigáveis. */
function mapDbError(message: string): string {
  const key = (message || "").trim();
  const table: Record<string, string> = {
    LIMITE_ATINGIDO:
      "Você atingiu o limite de agendamentos do seu plano neste ciclo. Faça upgrade para continuar recebendo novos agendamentos.",
    PLANO_EXPIRADO:
      "Sua assinatura não está ativa. Assine um plano para continuar agendando.",
    HORARIO_INDISPONIVEL: "Esse horário acabou de ser ocupado. Escolha outro.",
    ALMOCO: "Esse horário é o seu intervalo de almoço.",
    HORARIO_FIXO: "Esse horário não é um dos horários de marcação permitidos.",
    FECHADO: "O estabelecimento está fechado nesse dia.",
    FORA_DO_HORARIO: "Esse horário está fora do funcionamento.",
    BLOQUEADO: "Esse período está bloqueado na agenda.",
    DATA_PASSADA: "Não é possível agendar no passado.",
    SERVICO_INVALIDO: "Serviço inválido ou inativo.",
    NEGOCIO_INVALIDO: "Estabelecimento inválido.",
    ACESSO_NEGADO: "Acesso negado.",
  };
  return table[key] ?? "Não foi possível criar o agendamento. Tente novamente.";
}

// ---------------------------------------------------------------------
// Criar agendamento pelo proprietário
// ---------------------------------------------------------------------
export async function createAppointmentByOwner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const serviceId = String(formData.get("serviceId") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhoneRaw = String(formData.get("customerPhone") ?? "");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "") || null;
  // Atendimento avulso: cliente que chegou sem agendar. Sem horário fixo,
  // só lança na agenda (e, se marcado, já conta no faturamento).
  const avulso = String(formData.get("avulso") ?? "") === "1";
  const finalizado = String(formData.get("finalizado") ?? "") === "1";

  const fieldErrors: Record<string, string> = {};
  if (!serviceId) fieldErrors.serviceId = "Selecione um serviço";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fieldErrors.date = "Escolha a data";
  // No avulso não há horário a escolher.
  if (!avulso && !/^\d{2}:\d{2}$/.test(time))
    fieldErrors.time = "Escolha o horário";
  if (customerName.length < 2) fieldErrors.customerName = "Informe o nome";

  const phone = normalizePhone(customerPhoneRaw);
  if (!phone) fieldErrors.customerPhone = "Telefone inválido";

  // Preço opcional (sobrescreve o do serviço). Vazio = usa o do serviço.
  let priceCents: number | null = null;
  if (priceRaw !== "") {
    priceCents = parseCurrencyToCents(priceRaw);
    if (priceCents === null) fieldErrors.price = "Preço inválido";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();

  // -------------------------------------------------------------------
  // Atendimento avulso (sem horário): lança direto na agenda.
  // Mantém as regras de negócio importantes (assinatura ativa + limite do
  // ciclo), mas ignora as checagens de horário (almoço, horário fixo,
  // sobreposição), que não fazem sentido para quem chega sem marcar.
  // -------------------------------------------------------------------
  if (avulso) {
    const tz = ctx.business.timezone;

    if (!planState(ctx.business).active) {
      return { error: mapDbError("PLANO_EXPIRADO") };
    }
    const usage = await getUsage(supabase, ctx.business, tz);
    if (usage.reachedLimit) {
      return { error: mapDbError("LIMITE_ATINGIDO") };
    }

    const { data: svc } = await supabase
      .from("services")
      .select("name, price_cents, duration_minutes")
      .eq("id", serviceId)
      .eq("is_active", true)
      .maybeSingle();
    if (!svc) return { fieldErrors: { serviceId: "Serviço inválido" } };

    // Hoje -> agora; outra data -> meio-dia daquela data.
    const start =
      date === localDayString(tz)
        ? new Date()
        : localToUtc(date, "12:00", tz);
    const end = new Date(start.getTime() + svc.duration_minutes * 60_000);

    // Vincula (ou cria) o cliente para aparecer na aba Clientes.
    let customerId: string | null = null;
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();
    if (existing) {
      customerId = existing.id as string;
    } else {
      const { data: created } = await supabase
        .from("customers")
        .insert({ business_id: ctx.business.id, name: customerName, phone })
        .select("id")
        .maybeSingle();
      customerId = (created?.id as string) ?? null;
    }

    const { error: insErr } = await supabase.from("appointments").insert({
      business_id: ctx.business.id,
      customer_id: customerId,
      service_id: serviceId,
      customer_name_snapshot: customerName,
      customer_phone_snapshot: phone,
      service_name_snapshot: svc.name,
      price_cents: priceCents ?? svc.price_cents,
      duration_minutes: svc.duration_minutes,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: finalizado ? "completed" : "scheduled",
      booking_source: "admin",
      notes,
      idempotency_key: idempotencyKey,
    });
    if (insErr) {
      return { error: "Não foi possível lançar o atendimento. Tente novamente." };
    }

    revalidatePath("/agenda");
    revalidatePath("/inicio");
    revalidatePath("/financeiro");
    revalidatePath("/clientes");
    redirect("/agenda");
  }

  // O limite do plano/ciclo e a validade da assinatura são impostos de forma
  // ATÔMICA dentro da função do banco (create_appointment), sob advisory lock.
  // Aqui não confiamos em contagem no app: apenas traduzimos o erro retornado.
  const startAt = localToUtc(date, time, ctx.business.timezone).toISOString();

  const { error } = await supabase.rpc("create_appointment", {
    p_business_id: ctx.business.id,
    p_service_id: serviceId,
    p_customer_name: customerName,
    p_customer_phone: phone,
    p_start_at: startAt,
    p_booking_source: "admin",
    p_price_cents: priceCents,
    p_duration_minutes: null,
    p_notes: notes,
    p_idempotency_key: idempotencyKey,
  });

  if (error) return { error: mapDbError(error.message) };

  revalidatePath("/agenda");
  revalidatePath("/inicio");
  revalidatePath("/clientes");
  redirect("/agenda");
}

// ---------------------------------------------------------------------
// Alterar status (iniciar / finalizar / cancelar / não compareceu)
// ---------------------------------------------------------------------
export async function setAppointmentStatus(
  id: string,
  status: AppointmentStatus,
) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  // O RLS garante que só é possível alterar agendamentos do próprio negócio.
  await supabase.from("appointments").update({ status }).eq("id", id);

  revalidatePath("/agenda");
  revalidatePath("/inicio");
  revalidatePath("/clientes");
  revalidatePath("/financeiro");
}
