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
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const { name, phone, whatsapp } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      phone: phone ? normalizePhone(phone) : null,
      whatsapp: whatsapp ? normalizePhone(whatsapp) : null,
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

// --- Horários de funcionamento ---
export async function updateHours(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const rows = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    const isOpen = formData.get(`open_${weekday}`) === "on";
    const start = String(formData.get(`start_${weekday}`) ?? "");
    const end = String(formData.get(`end_${weekday}`) ?? "");

    if (isOpen) {
      if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
        return { error: "Preencha os horários dos dias abertos." };
      }
      if (start >= end) {
        return { error: "O horário de fim deve ser após o de início." };
      }
    }

    rows.push({
      business_id: ctx.business.id,
      weekday,
      is_open: isOpen,
      start_time: isOpen ? start : null,
      end_time: isOpen ? end : null,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_hours")
    .upsert(rows, { onConflict: "business_id,weekday" });
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
