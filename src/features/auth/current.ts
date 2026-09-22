import { createClient } from "@/lib/supabase/server";
import type { Business, Profile } from "@/types/database";

/**
 * Retorna o usuário logado, seu perfil e seu estabelecimento.
 * Retorna null se não houver sessão válida.
 */
export async function getCurrentContext(): Promise<{
  userId: string;
  profile: Profile;
  business: Business;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", profile.business_id)
    .maybeSingle();
  if (!business) return null;

  return { userId: user.id, profile, business };
}
