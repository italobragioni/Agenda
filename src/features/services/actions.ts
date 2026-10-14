"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { serviceSchema } from "@/validation/service";
import { zodFieldErrors, type ActionState } from "@/lib/forms";
import { maxServicesFor, PLANS } from "@/features/billing/plan";

/** Colunas opcionais de preço por porte (migração 0010). */
const VEHICLE_FIELDS = [
  "price_hatch_cents",
  "price_sedan_cents",
  "price_suv_cents",
  "price_caminhonete_cents",
] as const;

/** Erro de coluna de preço por porte inexistente (migração 0010 não aplicada). */
function isMissingVehicleColumn(err: {
  code?: string;
  message?: string;
}): boolean {
  if (err.code === "PGRST204" || err.code === "42703") return true;
  const msg = (err.message ?? "").toLowerCase();
  return VEHICLE_FIELDS.some((f) => msg.includes(f));
}

/** Remove os campos de preço por porte (fallback quando a coluna não existe). */
function withoutVehicleFields<T extends Record<string, unknown>>(data: T) {
  const out: Record<string, unknown> = { ...data };
  for (const f of VEHICLE_FIELDS) delete out[f];
  return out;
}

// ---------------------------------------------------------------------
// Criar serviço
// ---------------------------------------------------------------------
export async function createService(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price_cents: formData.get("price_cents"),
    price_hatch_cents: formData.get("price_hatch_cents"),
    price_sedan_cents: formData.get("price_sedan_cents"),
    price_suv_cents: formData.get("price_suv_cents"),
    price_caminhonete_cents: formData.get("price_caminhonete_cents"),
    duration_minutes: formData.get("duration_minutes"),
    is_active: formData.get("is_active"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();

  // Limite de serviços cadastrados do plano (regra de negócio, no servidor).
  const maxServices = maxServicesFor(ctx.business.plan);
  if (maxServices !== null) {
    const { count } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("business_id", ctx.business.id);
    if ((count ?? 0) >= maxServices) {
      const planName =
        ctx.business.plan === "basic" ? PLANS.basic.name : PLANS.premium.name;
      return {
        error: `Seu plano ${planName} permite até ${maxServices} serviços. Faça upgrade para cadastrar mais.`,
      };
    }
  }

  const row = { business_id: ctx.business.id, ...parsed.data };
  let { error } = await supabase.from("services").insert(row);
  // Se as colunas de preço por porte ainda não existirem no banco (migração
  // 0010 não aplicada), salva sem elas para não bloquear o cadastro.
  if (error && isMissingVehicleColumn(error)) {
    ({ error } = await supabase
      .from("services")
      .insert(withoutVehicleFields(row)));
  }
  if (error) {
    console.error("createService insert error:", error);
    return { error: "Não foi possível salvar o serviço. Tente novamente." };
  }

  revalidatePath("/servicos");
  redirect("/servicos");
}

// ---------------------------------------------------------------------
// Editar serviço
// ---------------------------------------------------------------------
export async function updateService(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price_cents: formData.get("price_cents"),
    price_hatch_cents: formData.get("price_hatch_cents"),
    price_sedan_cents: formData.get("price_sedan_cents"),
    price_suv_cents: formData.get("price_suv_cents"),
    price_caminhonete_cents: formData.get("price_caminhonete_cents"),
    duration_minutes: formData.get("duration_minutes"),
    is_active: formData.get("is_active"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  // O RLS garante que só é possível atualizar serviços do próprio negócio.
  let { error } = await supabase
    .from("services")
    .update(parsed.data)
    .eq("id", id);
  if (error && isMissingVehicleColumn(error)) {
    ({ error } = await supabase
      .from("services")
      .update(withoutVehicleFields(parsed.data))
      .eq("id", id));
  }
  if (error) {
    console.error("updateService error:", error);
    return { error: "Não foi possível atualizar o serviço." };
  }

  revalidatePath("/servicos");
  redirect("/servicos");
}

// ---------------------------------------------------------------------
// Ativar / desativar serviço (não apaga: preserva o histórico)
// ---------------------------------------------------------------------
export async function setServiceActive(id: string, isActive: boolean) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/servicos");
}

// ---------------------------------------------------------------------
// Excluir serviço (o histórico de agendamentos é preservado, pois cada
// agendamento guarda o nome do serviço; o service_id vira nulo).
// ---------------------------------------------------------------------
export async function deleteService(id: string): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  // O RLS garante que só é possível excluir serviços do próprio negócio.
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    console.error("deleteService error:", error);
    return { error: "Não foi possível excluir o serviço." };
  }
  revalidatePath("/servicos");
  return { success: "Serviço excluído." };
}
