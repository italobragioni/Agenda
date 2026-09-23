"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { localToUtc, dayRangeUtc } from "@/lib/datetime";
import type { ActionState } from "@/lib/forms";

// Adiciona um bloqueio (almoço, folga, compromisso).
export async function addBlockedTime(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const date = String(formData.get("date") ?? "");
  const allDay = formData.get("allDay") === "on";
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Escolha uma data." };
  }

  let startAt: Date;
  let endAt: Date;
  if (allDay) {
    const range = dayRangeUtc(date, tz);
    startAt = range.start;
    endAt = range.end;
  } else {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
      return { error: "Preencha início e fim." };
    }
    if (start >= end) {
      return { error: "O fim deve ser após o início." };
    }
    startAt = localToUtc(date, start, tz);
    endAt = localToUtc(date, end, tz);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blocked_times").insert({
    business_id: ctx.business.id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    reason,
  });
  if (error) return { error: "Não foi possível adicionar o bloqueio." };

  revalidatePath("/configuracoes");
  return { success: "Bloqueio adicionado." };
}

export async function deleteBlockedTime(id: string) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  await supabase.from("blocked_times").delete().eq("id", id);
  revalidatePath("/configuracoes");
}
