import { createAdminClient } from "@/lib/supabase/admin";
import type { Appointment, Business } from "@/types/database";

/**
 * Carrega os dados de um recibo por id do agendamento usando o cliente
 * administrativo (ignora RLS). Pensado para o link público do recibo:
 * o id é um UUID não adivinhável, então só quem recebe o link acessa.
 */
export async function loadReceiptById(
  id: string,
): Promise<{ appointment: Appointment; business: Business } | null> {
  // UUID inválido -> nem consulta.
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) return null;

  const admin = createAdminClient();

  const { data: appt } = await admin
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!appt) return null;

  const { data: biz } = await admin
    .from("businesses")
    .select("*")
    .eq("id", (appt as Appointment).business_id)
    .maybeSingle();
  if (!biz) return null;

  return { appointment: appt as Appointment, business: biz as Business };
}
