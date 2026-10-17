"use client";

import { useState } from "react";
import { Download, MessageCircle, ArrowLeft, Loader2, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Detecta iPhone/iPad (inclui iPadOS que se identifica como Mac com toque). */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iDevice || iPadOS;
}

/**
 * Ações da página de recibo.
 * - Baixar PDF: baixa o arquivo .pdf.
 * - Enviar no WhatsApp:
 *   • Android (com suporte): compartilha o ARQUIVO PDF direto (1 toque).
 *   • iPhone / navegadores sem suporte: abre o PDF; o usuário usa o
 *     compartilhamento nativo do aparelho para anexar o arquivo real
 *     (o envio direto pelo navegador manda um link "blob:" que o
 *     WhatsApp recusa).
 */
export function ReceiptActions({
  pdfUrl,
  fileName,
}: {
  pdfUrl: string;
  fileName: string;
}) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  const downloadUrl = `${pdfUrl}?download=1`;

  /** Dispara o download via link direto (sem blob, que o iOS trata mal). */
  function handleDownload() {
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /** Abre o PDF numa nova aba para o usuário compartilhar pelo aparelho. */
  function openForNativeShare() {
    window.open(pdfUrl, "_blank");
    setIosHint(true);
  }

  async function handleShare() {
    // No iPhone, o envio direto de arquivo pelo navegador é instável:
    // abre o PDF para o usuário compartilhar pelo próprio iOS.
    if (isIOS()) {
      openForNativeShare();
      return;
    }

    setSharing(true);
    try {
      const res = await fetch(pdfUrl);
      const blob = res.ok ? await res.blob() : null;
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
        await nav.share({ files: [file] });
        setSharing(false);
        return;
      }
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") {
        setSharing(false);
        return;
      }
    }

    // Sem suporte a compartilhar arquivo: abre o PDF para compartilhar.
    setSharing(false);
    openForNativeShare();
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-[460px] space-y-2">
      <Button fullWidth size="lg" onClick={handleDownload}>
        <Download className="h-4 w-4" aria-hidden />
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

      {iosHint && (
        <div className="rounded-lg bg-brand/5 px-3 py-3 text-sm text-foreground">
          <p className="font-medium">Abrimos o recibo numa nova aba.</p>
          <p className="mt-1 flex items-center gap-1 text-muted">
            Toque no ícone de compartilhar
            <Share className="inline h-4 w-4" aria-hidden />
            e escolha <strong className="text-foreground">WhatsApp</strong> — o
            PDF vai anexado.
          </p>
        </div>
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
