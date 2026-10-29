"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import { checklistPath, type Checklist } from "./checklist";
import type { ActionState } from "@/lib/forms";

const BUCKET = "atendimentos";

/** Confere, via RLS, que o atendimento pertence ao estabelecimento logado. */
async function ownsAppointment(appointmentId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id")
    .eq("id", appointmentId)
    .maybeSingle();
  return !!data;
}

/** Lê o checklist de um atendimento (null se ainda não houver). */
export async function getChecklist(
  businessId: string,
  appointmentId: string,
): Promise<Checklist | null> {
  const admin = createAdminClient();
  const { data } = await admin.storage
    .from(BUCKET)
    .download(checklistPath(businessId, appointmentId));
  if (!data) return null;
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as Partial<Checklist>;
    return {
      combustivel: parsed.combustivel ?? "",
      km: parsed.km ?? "",
      itens: Array.isArray(parsed.itens) ? parsed.itens : [],
      avarias: Array.isArray(parsed.avarias) ? parsed.avarias : [],
      observacoes: parsed.observacoes ?? "",
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    return null;
  }
}

/** Salva (cria ou substitui) o checklist do atendimento. */
export async function saveChecklist(
  appointmentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!(await ownsAppointment(appointmentId))) {
    return { error: "Atendimento não encontrado." };
  }

  const asString = (v: FormDataEntryValue | null) =>
    typeof v === "string" ? v.trim() : "";
  const asList = (vs: FormDataEntryValue[]) =>
    vs.filter((v): v is string => typeof v === "string");

  const checklist: Checklist = {
    combustivel: asString(formData.get("combustivel")),
    km: asString(formData.get("km")),
    itens: asList(formData.getAll("itens")),
    avarias: asList(formData.getAll("avarias")),
    observacoes: asString(formData.get("observacoes")),
    updatedAt: new Date().toISOString(),
  };

  const admin = createAdminClient();
  await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});

  const bytes = new TextEncoder().encode(JSON.stringify(checklist));
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(checklistPath(ctx.business.id, appointmentId), bytes, {
      upsert: true,
      contentType: "application/json",
    });
  if (error) {
    return { error: "Não foi possível salvar o checklist. Tente novamente." };
  }

  revalidatePath(`/agenda/${appointmentId}/checklist`);
  return { success: "Checklist salvo." };
}
