"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { normalizePhone } from "@/lib/phone";
import { parseCurrencyToCents } from "@/lib/money";
import { localToUtc } from "@/lib/datetime";
import type { ActionState } from "@/lib/forms";
import type { AppointmentStatus } from "@/types/database";

/** Traduz os erros vindos da função do banco para mensagens amigáveis. */
function mapDbError(message: string): string {
  const key = (message || "").trim();
  const table: Record<string, string> = {
    HORARIO_INDISPONIVEL: "Esse horário acabou de ser ocupado. Escolha outro.",
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

  const fieldErrors: Record<string, string> = {};
  if (!serviceId) fieldErrors.serviceId = "Selecione um serviço";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fieldErrors.date = "Escolha a data";
  if (!/^\d{2}:\d{2}$/.test(time)) fieldErrors.time = "Escolha o horário";
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

  const startAt = localToUtc(date, time, ctx.business.timezone).toISOString();

  const supabase = await createClient();
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
