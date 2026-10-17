import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { ReceiptDocument } from "@/features/appointments/receipt-document";
import { loadReceiptById } from "@/features/appointments/receipt-data";

export const metadata: Metadata = {
  title: "Recibo — Carvi",
  robots: { index: false, follow: false },
};

/**
 * Página PÚBLICA do recibo (destino do link enviado ao cliente). Não exige
 * login: mostra o recibo e um botão para baixar o PDF.
 */
export default async function PublicReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const loaded = await loadReceiptById(id);
  if (!loaded) notFound();
  const { appointment, business } = loaded;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <ReceiptDocument
        appointment={appointment}
        business={business}
        tz={business.timezone}
        issuedAtIso={new Date().toISOString()}
      />

      <div className="mx-auto mt-6 w-full max-w-[460px]">
        <a
          href={`/r/${id}/pdf?download=1`}
          className="tap flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Download className="h-4 w-4" aria-hidden />
          Baixar recibo em PDF
        </a>
      </div>
    </main>
  );
}
