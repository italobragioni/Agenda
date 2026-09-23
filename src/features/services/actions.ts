"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { serviceSchema } from "@/validation/service";
import { zodFieldErrors, type ActionState } from "@/lib/forms";

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
    duration_minutes: formData.get("duration_minutes"),
    is_active: formData.get("is_active"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    business_id: ctx.business.id,
    ...parsed.data,
  });
  if (error) return { error: "Não foi possível salvar o serviço." };

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
    duration_minutes: formData.get("duration_minutes"),
    is_active: formData.get("is_active"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createClient();
  // O RLS garante que só é possível atualizar serviços do próprio negócio.
  const { error } = await supabase
    .from("services")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: "Não foi possível atualizar o serviço." };

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
