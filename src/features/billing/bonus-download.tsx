import { Download, Gift } from "lucide-react";

const PDF_URL = "/plano-aumentar-faturamento-carvi.pdf";
const PDF_FILE = "Plano-para-Aumentar-o-Faturamento-Carvi.pdf";

/**
 * Cartão do bônus em PDF ("Plano para Aumentar o Faturamento"), liberado a
 * quem tem assinatura ativa. Mostrado nas telas de confirmação de pagamento,
 * de assinatura e no início.
 */
export function BonusDownload({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-brand/30 bg-brand-soft p-4 text-left ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Gift className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Seu bônus: Plano para Aumentar o Faturamento
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Material exclusivo para quem assina a Carvi. Baixe e comece a aplicar
            hoje.
          </p>
          <a
            href={PDF_URL}
            download={PDF_FILE}
            className="tap mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            <Download className="h-4 w-4" aria-hidden />
            Baixar PDF
          </a>
        </div>
      </div>
    </div>
  );
}
