"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import type { ActionState } from "@/lib/forms";

const BUCKET = "logos";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function uploadLogo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem." };
  }
  if (!ALLOWED[file.type]) {
    return { error: "Formato inválido. Use PNG, JPG, WEBP ou SVG." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Imagem muito grande. Máximo de 2 MB." };
  }

  try {
    const admin = createAdminClient();

    // Garante que o bucket público existe (ignora se já existir).
    await admin.storage
      .createBucket(BUCKET, { public: true })
      .catch(() => {});

    const ext = ALLOWED[file.type];
    const path = `${ctx.business.id}/logo.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, { upsert: true, contentType: file.type });
    if (upErr) {
      return { error: "Não foi possível enviar a imagem. Tente novamente." };
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    // Acrescenta um parâmetro para atualizar o cache do navegador.
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: dbErr } = await admin
      .from("businesses")
      .update({ logo_url: publicUrl })
      .eq("id", ctx.business.id);
    if (dbErr) return { error: "Não foi possível salvar a logo." };

    revalidatePath("/configuracoes");
    return { success: "Logo atualizada!" };
  } catch {
    return { error: "Não foi possível enviar a imagem. Tente novamente." };
  }
}

export async function removeLogo(): Promise<void> {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const admin = createAdminClient();
  // Remove os possíveis arquivos e limpa a URL.
  await admin.storage
    .from(BUCKET)
    .remove(
      ["png", "jpg", "webp", "svg"].map((e) => `${ctx.business.id}/logo.${e}`),
    )
    .catch(() => {});
  await admin
    .from("businesses")
    .update({ logo_url: null })
    .eq("id", ctx.business.id);

  revalidatePath("/configuracoes");
}
