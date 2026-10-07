"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentContext } from "@/features/auth/current";
import { capabilitiesFor } from "@/features/billing/plan";
import { inviteSchema } from "@/validation/team";
import { zodFieldErrors, type ActionState } from "@/lib/forms";

/** Garante que o chamador é o dono e tem o recurso de equipe (Empresarial). */
async function requireOwnerWithTeam() {
  const ctx = await getCurrentContext();
  if (!ctx) throw new Error("não autorizado");
  if (ctx.profile.role !== "owner") throw new Error("apenas o dono");
  if (!capabilitiesFor(ctx.business).team) throw new Error("recurso indisponível");
  return ctx;
}

/** Convida (cria) um novo funcionário no mesmo estabelecimento. */
export async function inviteMember(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let ctx;
  try {
    ctx = await requireOwnerWithTeam();
  } catch {
    return { error: "Recurso disponível apenas para o dono no plano Empresarial." };
  }

  const parsed = inviteSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const { full_name, email, password } = parsed.data;
  const admin = createAdminClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr || !created.user) {
    const msg = (createErr?.message ?? "").toLowerCase();
    if (msg.includes("already")) {
      return { error: "Já existe uma conta com este e-mail." };
    }
    return { error: "Não foi possível criar o acesso. Tente novamente." };
  }

  const { error: profErr } = await admin.from("profiles").insert({
    id: created.user.id,
    business_id: ctx.business.id,
    full_name,
    role: "staff",
  });
  if (profErr) {
    // Desfaz o usuário para não deixar conta órfã.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Não foi possível concluir o convite. Tente novamente." };
  }

  revalidatePath("/equipe");
  return { success: `${full_name} agora tem acesso à sua conta.` };
}

/** Remove um funcionário (não permite remover o dono). */
export async function removeMember(userId: string) {
  const ctx = await requireOwnerWithTeam();
  const admin = createAdminClient();

  // Só remove um funcionário do próprio estabelecimento.
  const { data: target } = await admin
    .from("profiles")
    .select("id, business_id, role")
    .eq("id", userId)
    .maybeSingle();

  if (
    !target ||
    target.business_id !== ctx.business.id ||
    target.role === "owner"
  ) {
    return;
  }

  // Apagar o usuário remove o perfil em cascata.
  await admin.auth.admin.deleteUser(userId);
  revalidatePath("/equipe");
}
