import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase ADMINISTRATIVO (service_role).
 *
 * ATENÇÃO: usa a chave secreta service_role, que ignora o Row Level Security.
 * DEVE ser usado SOMENTE em código de servidor (Server Actions e Route
 * Handlers) e NUNCA importado em componentes do navegador.
 *
 * Usos previstos:
 *  - Cadastro do estabelecimento (criar business + profile).
 *  - Página pública de agendamento (cliente final sem login), onde o
 *    servidor entrega apenas os dados necessários e cria o agendamento
 *    de forma controlada.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
