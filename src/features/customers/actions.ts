"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { normalizePhone } from "@/lib/phone";
import type { ActionState } from "@/lib/forms";

/** Detecta erro de coluna inexistente (migração 0016 ainda não aplicada). */
function isUnknownVehicleColumn(err: { code?: string; message?: string }): boolean {
  const msg = (err.message ?? "").toLowerCase();
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    (msg.includes("vehicle") && (msg.includes("column") || msg.includes("schema cache")))
  );
}

// ---------------------------------------------------------------------
// Adicionar cliente manualmente (aba Clientes)
// ---------------------------------------------------------------------
export async function createCustomer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");
  const vehicle = String(formData.get("vehicle") ?? "").trim() || null;

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Informe o nome";
  const phone = normalizePhone(phoneRaw);
  if (!phone) fieldErrors.phone = "Celular inválido";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const supabase = await createClient();

  const base = { business_id: ctx.business.id, name, phone: phone as string };

  // Tenta salvar com o carro; se a coluna ainda não existir (migração 0016
  // não aplicada), salva sem o carro para não perder o cadastro.
  let error = vehicle
    ? (await supabase.from("customers").insert({ ...base, vehicle })).error
    : (await supabase.from("customers").insert(base)).error;

  if (error && vehicle && isUnknownVehicleColumn(error)) {
    error = (await supabase.from("customers").insert(base)).error;
  }

  if (error) {
    // Telefone duplicado (unique business_id, phone).
    if ((error as { code?: string }).code === "23505") {
      return { fieldErrors: { phone: "Já existe um cliente com esse celular." } };
    }
    return { error: "Não foi possível salvar o cliente. Tente novamente." };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}
