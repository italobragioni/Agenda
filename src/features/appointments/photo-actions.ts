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
  /** Caminho relativo à pasta do atendimento (ex.: "antes/uuid.jpg"). */
  path: string;
  url: string;
}

export interface GroupedPhotos {
  antes: AppointmentPhoto[];
  depois: AppointmentPhoto[];
  /** Fotos antigas, enviadas antes da separação por fase. */
  outras: AppointmentPhoto[];
}

export type PhotoPhase = "antes" | "depois";

/** Lista uma subpasta (ou a raiz) do atendimento com URLs assinadas. */
async function listFolder(
  admin: ReturnType<typeof createAdminClient>,
  businessId: string,
  appointmentId: string,
  sub: "" | PhotoPhase,
): Promise<AppointmentPhoto[]> {
  const base = `${businessId}/${appointmentId}`;
  const folder = sub ? `${base}/${sub}` : base;
  const { data } = await admin.storage
    .from(BUCKET)
    .list(folder, { limit: 200, sortBy: { column: "created_at", order: "asc" } });
  // Na raiz, as subpastas (antes/depois) aparecem como entradas sem id — ignora.
  const files = (data ?? []).filter(
    (f) => f.name && !f.name.startsWith(".") && f.id,
  );

  const out: AppointmentPhoto[] = [];
  for (const f of files) {
    const { data: signed } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(`${folder}/${f.name}`, 60 * 60); // 1 hora
    if (signed?.signedUrl) {
      out.push({ path: sub ? `${sub}/${f.name}` : f.name, url: signed.signedUrl });
    }
  }
  return out;
}

/** Lista as fotos do atendimento separadas em antes / depois / outras. */
export async function listAppointmentPhotos(
  businessId: string,
  appointmentId: string,
): Promise<GroupedPhotos> {
  const admin = createAdminClient();
  const [antes, depois, outras] = await Promise.all([
    listFolder(admin, businessId, appointmentId, "antes"),
    listFolder(admin, businessId, appointmentId, "depois"),
    listFolder(admin, businessId, appointmentId, ""),
  ]);
  return { antes, depois, outras };
}

/** Envia uma ou mais fotos para o atendimento, na fase indicada. */
export async function uploadAppointmentPhotos(
  appointmentId: string,
  phase: PhotoPhase,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!(await ownsAppointment(appointmentId))) {
    return { error: "Atendimento não encontrado." };
  }
  const safePhase: PhotoPhase = phase === "depois" ? "depois" : "antes";

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
    const path = `${ctx.business.id}/${appointmentId}/${safePhase}/${randomUUID()}.${ext}`;
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

/** Remove uma foto do atendimento (path relativo, ex.: "antes/uuid.jpg"). */
export async function removeAppointmentPhoto(
  appointmentId: string,
  relPath: string,
): Promise<void> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");
  if (!(await ownsAppointment(appointmentId))) return;
  // Só aceita "nome.ext" ou "antes/nome.ext" / "depois/nome.ext".
  if (!/^(antes\/|depois\/)?[A-Za-z0-9._-]+$/.test(relPath)) return;

  const admin = createAdminClient();
  await admin.storage
    .from(BUCKET)
    .remove([`${ctx.business.id}/${appointmentId}/${relPath}`])
    .catch(() => {});

  revalidatePath(`/agenda/${appointmentId}/fotos`);
}
