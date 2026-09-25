import { createClient } from "@/lib/supabase/server";
import type { Business, Profile } from "@/types/database";

/**
 * Retorna o usuário logado, seu perfil e seu estabelecimento.
 * Retorna null se não houver sessão válida.
 */
export async function getCurrentContext(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
  business: Business;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Uma única consulta: perfil + estabelecimento (via join).
  const { data } = await supabase
    .from("profiles")
    .select("*, business:businesses(*)")
    .eq("id", user.id)
    .maybeSingle();
  if (!data || !data.business) return null;

  const { business, ...profile } = data as Profile & { business: Business };

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile as Profile,
    business: business as Business,
  };
}
