"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
} from "@/validation/auth";
import { normalizePhone } from "@/lib/phone";
import { slugify } from "@/lib/slug";

export interface ActionState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
}

/** Achata os erros do Zod em um mapa campo -> mensagem. */
function zodFieldErrors(
  flatten: { fieldErrors: Record<string, string[] | undefined> },
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(flatten.fieldErrors)) {
    if (msgs && msgs.length > 0) out[key] = msgs[0];
  }
  return out;
}

/** Gera um slug único consultando o banco (adiciona -2, -3... se necessário). */
async function generateUniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string,
): Promise<string> {
  const root = slugify(base) || "estabelecimento";
  let candidate = root;
  let n = 1;
  // Tenta no máximo algumas vezes; colisões são raras.
  while (n < 50) {
    const { data } = await admin
      .from("businesses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  // Fallback improvável: sufixo aleatório.
  return `${root}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------------------
// Cadastro do estabelecimento (cria user + business + profile + horários)
// ---------------------------------------------------------------------
export async function signup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    ownerName: formData.get("ownerName"),
    businessName: formData.get("businessName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error.flatten()) };
  }

  const { ownerName, businessName, phone, email, password } = parsed.data;
  const normalizedPhone = normalizePhone(phone)!;
  const admin = createAdminClient();

  // 1. Cria o usuário de autenticação (já confirmado para o MVP).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: ownerName },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? "";
    if (msg.toLowerCase().includes("already")) {
      return { error: "Já existe uma conta com este e-mail." };
    }
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  const userId = created.user.id;

  // 2. Cria o estabelecimento, o perfil e os horários padrão.
  try {
    const slug = await generateUniqueSlug(admin, businessName);

    const trialEndsAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const { data: business, error: bizErr } = await admin
      .from("businesses")
      .insert({
        name: businessName,
        slug,
        phone: normalizedPhone,
        whatsapp: normalizedPhone,
        plan: "trial",
        trial_ends_at: trialEndsAt,
      })
      .select("id")
      .single();
    if (bizErr || !business) throw bizErr ?? new Error("business");

    const { error: profErr } = await admin.from("profiles").insert({
      id: userId,
      business_id: business.id,
      full_name: ownerName,
    });
    if (profErr) throw profErr;

    // Horários padrão: seg-sáb 08:00-18:00, domingo fechado.
    const hours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      business_id: business.id,
      weekday,
      is_open: weekday !== 0,
      start_time: weekday !== 0 ? "08:00" : null,
      end_time: weekday !== 0 ? "18:00" : null,
    }));
    const { error: hoursErr } = await admin.from("business_hours").insert(hours);
    if (hoursErr) throw hoursErr;
  } catch {
    // Desfaz o usuário criado para não deixar conta órfã.
    await admin.auth.admin.deleteUser(userId);
    return { error: "Não foi possível concluir o cadastro. Tente novamente." };
  }

  // 3. Inicia a sessão (define os cookies) e vai para o onboarding.
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) {
    // Conta criada, mas login falhou: manda para a tela de login.
    redirect("/login");
  }

  redirect("/onboarding");
}

// ---------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------
export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error.flatten()) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/inicio");
}

// ---------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------------------------------------------------------------------
// Esqueci a senha (envia e-mail de recuperação)
// ---------------------------------------------------------------------
export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error.flatten()) };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/redefinir-senha`,
  });

  // Sempre retornamos sucesso (não revelamos se o e-mail existe).
  return {
    success:
      "Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha.",
  };
}
