import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { ReceiptDocument } from "@/features/appointments/receipt-document";
import { ReceiptActions } from "@/features/appointments/receipt-actions";
import { whatsappLink } from "@/lib/phone";
import type { Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Recibo — Carvi" };

/**
 * Página de recibo de um agendamento. Mostra um documento pronto para
 * imprimir / salvar como PDF, personalizado com a marca do estabelecimento
 * e o rodapé "Feito com Carvi".
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
  const issuedAtIso = new Date().toISOString();

  const numero = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  const pdfUrl = `/recibo/${id}/pdf`;
  const fileName = `recibo-${numero}.pdf`;
  const shareText = `Recibo - ${ctx.business.name}`;

  // Plano B de envio (quando o navegador não anexa arquivo): abre o WhatsApp
  // do cliente com um texto curto; o PDF baixado é anexado manualmente.
  const whatsappFallbackHref = appointment.customer_phone_snapshot
    ? whatsappLink(
        appointment.customer_phone_snapshot,
        `${shareText}\nSegue o recibo do seu atendimento em anexo.`,
      )
    : null;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <ReceiptDocument
        appointment={appointment}
        business={ctx.business}
        tz={tz}
        issuedAtIso={issuedAtIso}
      />
      <ReceiptActions
        pdfUrl={pdfUrl}
        fileName={fileName}
        shareText={shareText}
        whatsappFallbackHref={whatsappFallbackHref}
      />
    </main>
  );
}
