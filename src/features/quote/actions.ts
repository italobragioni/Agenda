"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { normalizePhone } from "@/lib/phone";
import type { QuoteItem } from "@/types/database";

export interface SaveQuoteInput {
  clientName?: string;
  clientPhone?: string;
  items: QuoteItem[];
  note?: string;
  validity?: string;
}

export async function saveQuote(
  input: SaveQuoteInput,
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const items = (input.items ?? [])
    .map((it) => ({
      desc: String(it?.desc ?? "").trim(),
      cents: Number.isFinite(it?.cents) ? Math.max(0, Math.round(it.cents)) : 0,
    }))
    .filter((it) => it.desc !== "" || it.cents > 0);

  if (items.length === 0) {
    return { ok: false, error: "Adicione pelo menos um item." };
  }

  const totalCents = items.reduce((sum, it) => sum + it.cents, 0);
  const clientName = (input.clientName ?? "").trim() || null;
  const clientPhone = input.clientPhone
    ? normalizePhone(input.clientPhone)
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from("quotes").insert({
    business_id: ctx.business.id,
    client_name: clientName,
    client_phone: clientPhone,
    items,
    note: (input.note ?? "").trim() || null,
    validity: (input.validity ?? "").trim() || null,
    total_cents: totalCents,
  });
  if (error) {
    return {
      ok: false,
      error:
        "Não foi possível salvar. Rode o comando do banco (enviado) e tente de novo.",
    };
  }

  revalidatePath("/orcamento");
  return { ok: true };
}

export async function deleteQuote(id: string): Promise<void> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  await supabase.from("quotes").delete().eq("id", id);
  revalidatePath("/orcamento");
}
