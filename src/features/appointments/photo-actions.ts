"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import type { ActionState } from "@/lib/forms";

const BUCKET = "atendimentos";
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB por foto
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

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

export interface AppointmentPhoto {
  name: string;
  url: string;
}

/** Lista as fotos de um atendimento com URLs temporárias (assinadas). */
export async function listAppointmentPhotos(
  businessId: string,
  appointmentId: string,
): Promise<AppointmentPhoto[]> {
  const admin = createAdminClient();
  const folder = `${businessId}/${appointmentId}`;
  const { data } = await admin.storage
    .from(BUCKET)
    .list(folder, { limit: 200, sortBy: { column: "created_at", order: "asc" } });
  const files = (data ?? []).filter((f) => f.name && !f.name.startsWith("."));

  const out: AppointmentPhoto[] = [];
  for (const f of files) {
    const { data: signed } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(`${folder}/${f.name}`, 60 * 60); // 1 hora
    if (signed?.signedUrl) out.push({ name: f.name, url: signed.signedUrl });
  }
  return out;
}

/** Envia uma ou mais fotos para o atendimento. */
export async function uploadAppointmentPhotos(
  appointmentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!(await ownsAppointment(appointmentId))) {
    return { error: "Atendimento não encontrado." };
  }

  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Nenhuma foto selecionada." };

  const admin = createAdminClient();
  // Cria o balde privado na primeira vez (ignora se já existir).
  await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});

  let uploaded = 0;
  let tooBig = false;
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      tooBig = true;
      continue;
    }
    const ext = EXT[file.type] ?? "jpg";
    const path = `${ctx.business.id}/${appointmentId}/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (!error) uploaded += 1;
  }

  if (uploaded === 0) {
    return {
      error: tooBig
        ? "Foto muito grande (máx. 12 MB cada)."
        : "Não foi possível enviar as fotos. Tente novamente.",
    };
  }

  revalidatePath(`/agenda/${appointmentId}/fotos`);
  return {
    success: uploaded === 1 ? "Foto adicionada." : `${uploaded} fotos adicionadas.`,
  };
}

/** Remove uma foto do atendimento. */
export async function removeAppointmentPhoto(
  appointmentId: string,
  name: string,
): Promise<void> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!(await ownsAppointment(appointmentId))) return;
  // Evita sair da pasta do atendimento.
  if (name.includes("/") || name.includes("..")) return;

  const admin = createAdminClient();
  await admin.storage
    .from(BUCKET)
    .remove([`${ctx.business.id}/${appointmentId}/${name}`])
    .catch(() => {});

  revalidatePath(`/agenda/${appointmentId}/fotos`);
}
