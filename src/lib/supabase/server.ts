import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso no SERVIDOR (Server Components, Server Actions
 * e Route Handlers). Lê a sessão do usuário logado a partir dos cookies,
 * usando a chave pública (anon). O Row Level Security garante o isolamento
 * entre estabelecimentos.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // O método setAll pode ser chamado a partir de um Server Component,
            // onde não é possível escrever cookies. Isso pode ser ignorado com
            // segurança quando há um middleware atualizando a sessão.
          }
        },
      },
    },
  );
}
