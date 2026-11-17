"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import { normalizePhone } from "@/lib/phone";
import { slugify } from "@/lib/slug";
import { businessInfoSchema, slugSchema } from "@/validation/settings";
import { zodFieldErrors, type ActionState } from "@/lib/forms";
import { maxBoxesFor } from "@/features/billing/plan";
import { normalizeEnd, isValidRange } from "@/features/settings/hours";

// --- Meu negócio ---
export async function updateBusinessInfo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const parsed = businessInfoSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const { name, phone, whatsapp, address } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      phone: phone ? normalizePhone(phone) : null,
      whatsapp: whatsapp ? normalizePhone(whatsapp) : null,
      address,
    })
    .eq("id", ctx.business.id);
  if (error) return { error: "Não foi possível salvar." };

  revalidatePath("/configuracoes");
  return { success: "Dados atualizados com sucesso." };
}

// --- Intervalo entre clientes ---
export async function updateInterval(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const minutes = Number(formData.get("interval"));
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 240) {
    return { error: "Intervalo inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ appointment_interval_minutes: minutes })
    .eq("id", ctx.business.id);
  if (error) return { error: "Não foi possível salvar." };

  revalidatePath("/configuracoes");
  return { success: "Intervalo atualizado." };
}

// --- Capacidade (nº de boxes / atendimentos simultâneos) ---
export async function updateCapacity(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const capacity = Number(formData.get("capacity"));
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
    return { error: "Informe um número entre 1 e 50." };
  }

  // Teto de boxes do plano (null = ilimitado). Regra de negócio no servidor.
  const maxBoxes = maxBoxesFor(ctx.business.plan);
  if (maxBoxes !== null && capacity > maxBoxes) {
    return {
      error: `Seu plano permite até ${maxBoxes} ${maxBoxes === 1 ? "box" : "boxes"}. Faça upgrade para ter mais.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ capacity })
    .eq("id", ctx.business.id);
  if (error) return { error: "Não foi possível salvar." };

  revalidatePath("/configuracoes");
  return { success: "Capacidade atualizada." };
}

// --- Horários fixos de marcação (ex.: só 08:00 e 13:00) ---
export async function updateFixedSlots(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const enabled = formData.get("fixed_enabled") === "on";

  let value: string[] | null = null;
  if (enabled) {
    // Coleta, valida (HH:MM), remove duplicados e ordena.
    const raw = formData.getAll("fixed_time").map((t) => String(t).trim());
    const seen = new Set<string>();
    for (const t of raw) {
      if (t === "") continue;
      if (!/^\d{2}:\d{2}$/.test(t)) {
        return { error: "Horário inválido. Use o formato HH:MM." };
      }
      seen.add(t);
    }
    if (seen.size === 0) {
      return { error: "Adicione pelo menos um horário, ou desligue a opção." };
    }
    value = Array.from(seen).sort();
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ fixed_slot_times: value })
    .eq("id", ctx.business.id);
  if (error) return { error: "Não foi possível salvar os horários." };

  revalidatePath("/configuracoes");
  return {
    success: enabled
      ? "Horários de marcação salvos."
      : "Voltou a aceitar qualquer horário.",
  };
}

// --- Horário de almoço (permanente, recorrente todo dia) ---
export async function updateLunch(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const hasLunch = formData.get("has_lunch") === "on";
  const start = String(formData.get("lunch_start") ?? "");
  const end = String(formData.get("lunch_end") ?? "");

  let lunchStart: string | null = null;
  let lunchEnd: string | null = null;

  if (hasLunch) {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
      return { error: "Preencha o início e o fim do almoço." };
    }
    if (start >= end) {
      return { error: "O fim do almoço deve ser depois do início." };
    }
    lunchStart = start;
    lunchEnd = end;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ lunch_start: lunchStart, lunch_end: lunchEnd })
    .eq("id", ctx.business.id);
  if (error) return { error: "Não foi possível salvar o horário de almoço." };

  revalidatePath("/configuracoes");
  return {
    success: hasLunch
      ? "Horário de almoço salvo."
      : "Horário de almoço removido.",
  };
}

// --- Horários de funcionamento (um ou vários períodos por dia) ---
export async function updateHours(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  // O formulário envia tudo em um JSON: { "1": [{start,end}, ...], ... }
  let parsed: Record<string, { start: string; end: string }[]>;
  try {
    parsed = JSON.parse(String(formData.get("hours_json") ?? "{}"));
  } catch {
    return { error: "Não foi possível ler os horários." };
  }

  const rows = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    const raw = Array.isArray(parsed[String(weekday)])
      ? parsed[String(weekday)]
      : [];
    const ranges = raw
      .map((r) => ({
        start: String(r?.start ?? "").slice(0, 5),
        // Meia-noite ("00:00") no fim = fim do dia ("24:00").
        end: normalizeEnd(String(r?.end ?? "").slice(0, 5)),
      }))
      .filter((r) => r.start !== "" || r.end !== "");

    for (const r of ranges) {
      if (!isValidRange(r)) {
        return {
          error: "Verifique os períodos: o fim deve ser depois do início.",
        };
      }
    }

    const sorted = ranges.sort((a, b) => a.start.localeCompare(b.start));
    const isOpen = sorted.length > 0;

    rows.push({
      business_id: ctx.business.id,
      weekday,
      is_open: isOpen,
      // Envelope (compatibilidade): 1º início e último fim.
      start_time: isOpen ? sorted[0].start : null,
      end_time: isOpen ? sorted[sorted.length - 1].end : null,
      // Lista completa de períodos.
      time_ranges: isOpen ? sorted : null,
    });
  }

  const supabase = await createClient();
  let { error } = await supabase
    .from("business_hours")
    .upsert(rows, { onConflict: "business_id,weekday" });

  // Resiliência: se a coluna time_ranges ainda não existir no banco, salva
  // ao menos o 1º período (envelope), para o app não travar antes do SQL.
  if (error) {
    const fallback = rows.map((r) => ({
      business_id: r.business_id,
      weekday: r.weekday,
      is_open: r.is_open,
      start_time: r.start_time,
      end_time: r.end_time,
    }));
    ({ error } = await supabase
      .from("business_hours")
      .upsert(fallback, { onConflict: "business_id,weekday" }));
  }
  if (error) return { error: "Não foi possível salvar os horários." };

  revalidatePath("/configuracoes");
  return { success: "Horários atualizados." };
}

// --- Apelido (slug) do link público ---
export async function updateSlug(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const parsed = slugSchema.safeParse({ slug: formData.get("slug") });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const slug = slugify(parsed.data.slug);
  if (slug.length < 3) {
    return { fieldErrors: { slug: "Use letras e números (mín. 3)." } };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .neq("id", ctx.business.id)
    .maybeSingle();
  if (existing) {
    return { fieldErrors: { slug: "Esse apelido já está em uso." } };
  }

  const { error } = await admin
    .from("businesses")
    .update({ slug })
    .eq("id", ctx.business.id);
  if (error) return { error: "Não foi possível salvar o apelido." };

  revalidatePath("/configuracoes");
  return { success: "Link atualizado!" };
}
