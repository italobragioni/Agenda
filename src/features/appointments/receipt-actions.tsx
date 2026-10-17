"use client";

import { useState } from "react";
import { Download, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Ações da página de recibo.
 * - Baixar PDF: baixa o arquivo .pdf direto.
 * - Enviar no WhatsApp: compartilha o ARQUIVO PDF (Web Share API). Se o
 *   navegador não suportar anexar arquivo, baixa o PDF e abre o WhatsApp
 *   para anexar manualmente.
 */
export function ReceiptActions({
  pdfUrl,
  fileName,
  whatsappFallbackHref,
}: {
  pdfUrl: string;
  fileName: string;
  whatsappFallbackHref: string | null;
}) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [manualHint, setManualHint] = useState(false);

  async function fetchPdfBlob(): Promise<Blob | null> {
    try {
      const res = await fetch(pdfUrl);
      if (!res.ok) return null;
      return await res.blob();
    } catch {
      return null;
    }
  }

  function saveBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    setDownloading(true);
    const blob = await fetchPdfBlob();
    if (blob) {
      saveBlob(blob);
    } else {
      // Plano B: abre a rota direta (com Content-Disposition: attachment).
      window.location.href = pdfUrl;
    }
    setDownloading(false);
  }

  async function handleShare() {
    setSharing(true);
    const blob = await fetchPdfBlob();
    const file = blob
      ? new File([blob], fileName, { type: "application/pdf" })
      : null;

    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    const canShareFile =
      !!file &&
      typeof nav.share === "function" &&
      typeof nav.canShare === "function" &&
      nav.canShare({ files: [file] });

    if (canShareFile && file) {
      try {
        // Compartilha SOMENTE o arquivo (sem texto/título): o WhatsApp falha
        // ao enviar quando vem texto junto com o anexo.
        await nav.share({ files: [file] });
        setSharing(false);
        return;
      } catch (err) {
        // Usuário cancelou o compartilhamento: não faz o plano B.
        if ((err as { name?: string })?.name === "AbortError") {
          setSharing(false);
          return;
        }
      }
    }

    // Plano B: baixa o PDF e abre o WhatsApp para anexar manualmente.
    if (blob) saveBlob(blob);
    if (whatsappFallbackHref) window.open(whatsappFallbackHref, "_blank");
    setManualHint(true);
    setSharing(false);
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-[460px] space-y-2">
      <Button fullWidth size="lg" onClick={handleDownload} disabled={downloading}>
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        Baixar PDF
      </Button>

      <Button
        fullWidth
        size="lg"
        variant="secondary"
        onClick={handleShare}
        disabled={sharing}
      >
        {sharing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <MessageCircle className="h-4 w-4" aria-hidden />
        )}
        Enviar no WhatsApp
      </Button>

      {manualHint && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          Baixamos o PDF e abrimos o WhatsApp. É só tocar no clipe (anexar) e
          escolher o recibo que acabou de baixar.
        </p>
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
