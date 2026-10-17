import Link from "next/link";
import { Download, MessageCircle, ArrowLeft } from "lucide-react";

const PRIMARY =
  "tap flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-base font-medium text-brand-foreground transition-colors hover:bg-brand-hover";
const SECONDARY =
  "tap flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-base font-medium text-foreground transition-colors hover:bg-slate-50";

/**
 * Ações da página de recibo (visão do estabelecimento).
 * - Baixar PDF: baixa o arquivo.
 * - Enviar no WhatsApp: abre a conversa do cliente no WhatsApp (app direto,
 *   não a tela de compartilhar do iOS, que é instável) com uma mensagem
 *   pronta e o link do recibo. O cliente abre o link e baixa o PDF.
 */
export function ReceiptActions({
  downloadUrl,
  whatsappHref,
}: {
  downloadUrl: string;
  whatsappHref: string | null;
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-[460px] space-y-2">
      <a href={downloadUrl} className={PRIMARY}>
        <Download className="h-4 w-4" aria-hidden />
        Baixar PDF
      </a>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={SECONDARY}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Enviar no WhatsApp
        </a>
      ) : (
        <p className="text-center text-xs text-muted">
          Este cliente não tem telefone cadastrado para enviar o recibo.
        </p>
      )}

      <Link
        href="/agenda"
        className="mx-auto flex items-center gap-1 pt-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para a agenda
      </Link>
    </div>
  );
}
