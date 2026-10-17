import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { ReceiptDocument } from "@/features/appointments/receipt-document";
import { ReceiptActions } from "@/features/appointments/receipt-actions";
import { whatsappLink } from "@/lib/phone";
import type { Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Recibo — Carvi" };

/**
 * Página do recibo (visão do estabelecimento). Mostra o recibo, permite
 * baixar o PDF e enviar ao cliente pelo WhatsApp (via link público do recibo).
 */
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  // RLS garante que só vem agendamento do próprio estabelecimento.
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const appointment = data as Appointment;

  const tz = ctx.business.timezone;

  // Origem absoluta para montar o link público do recibo.
  const h = await headers();
  const host = h.get("host") ?? "carvi.online";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const publicUrl = `${proto}://${host}/r/${id}`;

  const viewUrl = `/r/${id}/pdf`;
  const downloadUrl = `/r/${id}/pdf?download=1`;

  const phone = appointment.customer_phone_snapshot;
  const firstName = appointment.customer_name_snapshot.split(" ")[0];
  const whatsappHref = phone
    ? whatsappLink(
        phone,
        `Olá, ${firstName}! Segue o recibo do seu atendimento na ${ctx.business.name}:\n${publicUrl}`,
      )
    : null;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <ReceiptDocument
        appointment={appointment}
        business={ctx.business}
        tz={tz}
        issuedAtIso={new Date().toISOString()}
      />
      <ReceiptActions
        viewUrl={viewUrl}
        downloadUrl={downloadUrl}
        whatsappHref={whatsappHref}
      />
    </main>
  );
}
