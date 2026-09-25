"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { parseCurrencyToCents } from "@/lib/money";
import type { ActionState } from "@/lib/forms";

export async function addFinanceEntry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const type = String(formData.get("type") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const date = String(formData.get("occurred_on") ?? "");
  const amountCents = parseCurrencyToCents(String(formData.get("amount") ?? ""));

  if (type !== "income" && type !== "expense") {
    return { error: "Escolha entrada ou saída." };
  }
  if (amountCents === null || amountCents <= 0) {
    return { error: "Informe um valor válido." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Escolha a data." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("finance_entries").insert({
    business_id: ctx.business.id,
    type,
    description,
    category,
    amount_cents: amountCents,
    occurred_on: date,
  });
  if (error) return { error: "Não foi possível salvar o lançamento." };

  revalidatePath("/financeiro");
  return { success: "Lançamento adicionado." };
}

export async function deleteFinanceEntry(id: string) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  await supabase.from("finance_entries").delete().eq("id", id);
  revalidatePath("/financeiro");
}
