"use client";

import { Download, MessageCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Ações da página de recibo (não aparecem na impressão/PDF).
 * - Baixar PDF: abre a caixa de impressão do navegador (Salvar como PDF).
 * - Enviar no WhatsApp: manda a versão em texto para o cliente.
 */
export function ReceiptActions({
  whatsappHref,
}: {
  whatsappHref: string | null;
}) {
  const router = useRouter();

  return (
    <div className="no-print mx-auto mt-6 w-full max-w-[460px] space-y-2">
      <Button fullWidth size="lg" onClick={() => window.print()}>
        <Download className="h-4 w-4" aria-hidden />
        Baixar PDF
      </Button>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button fullWidth variant="secondary" size="lg">
            <MessageCircle className="h-4 w-4" aria-hidden />
            Enviar no WhatsApp
          </Button>
        </a>
      )}

      <button
        type="button"
        onClick={() => router.back()}
        className="mx-auto flex items-center gap-1 pt-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar
      </button>
    </div>
  );
}
