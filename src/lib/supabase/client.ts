import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso no NAVEGADOR (Client Components).
 * Usa apenas a chave pública (anon). O acesso aos dados é protegido
 * pelo Row Level Security do banco.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
