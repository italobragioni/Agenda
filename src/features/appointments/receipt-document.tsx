import { CheckCircle2 } from "lucide-react";
import { EstablishmentLogo, CarviWordmark } from "@/components/brand/logo";
import { formatCents } from "@/lib/money";
import { formatDateTimeBR, formatDateBR } from "@/lib/datetime";
import type { Appointment, Business } from "@/types/database";

/**
 * Documento visual do recibo (A4), pensado para impressão / salvar em PDF.
 * Puramente apresentacional: recebe o agendamento e o estabelecimento.
 */
export function ReceiptDocument({
  appointment: a,
  business,
  tz,
  issuedAtIso,
}: {
  appointment: Appointment;
  business: Business;
  tz: string;
  issuedAtIso: string;
}) {
  // Número do recibo: trecho curto e estável do id do agendamento.
  const numero = a.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  const linhas: { label: string; value: string }[] = [
    { label: "Cliente", value: a.customer_name_snapshot },
    { label: "Serviço", value: a.service_name_snapshot },
  ];
  if (a.notes) linhas.push({ label: "Observações", value: a.notes });
  linhas.push({ label: "Data do serviço", value: formatDateTimeBR(a.start_at, tz) });

  return (
    <div className="recibo-area mx-auto w-full max-w-[460px] rounded-2xl border border-border bg-white p-7 shadow-soft">
      {/* Cabeçalho: marca do estabelecimento */}
      <div className="flex flex-col items-center text-center">
        <EstablishmentLogo logoUrl={business.logo_url} className="h-12" />
        <h1 className="mt-3 text-lg font-bold tracking-tight text-foreground">
          {business.name}
        </h1>
        {business.phone && (
          <p className="text-xs text-muted">{business.phone}</p>
        )}
        {business.address && (
          <p className="mt-0.5 text-xs text-muted">{business.address}</p>
        )}
      </div>

      {/* Faixa do título */}
      <div className="mt-6 flex items-center justify-between border-y border-dashed border-border py-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Recibo
        </span>
        <span className="text-xs text-muted">Nº {numero}</span>
      </div>

      {/* Dados do atendimento */}
      <dl className="mt-5 space-y-3">
        {linhas.map((l) => (
          <div key={l.label} className="flex justify-between gap-4">
            <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">
              {l.label}
            </dt>
            <dd className="text-right text-sm text-foreground">{l.value}</dd>
          </div>
        ))}
      </dl>

      {/* Valor pago */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Valor pago
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatCents(a.price_cents)}
        </p>
      </div>

      {/* Confirmação */}
      <p className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Pagamento recebido
      </p>

      {/* Rodapé: emitido via Carvi */}
      <div className="mt-6 border-t border-border pt-4 text-center">
        <p className="text-[11px] text-muted">
          Emitido em {formatDateBR(issuedAtIso, tz)}
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted">
          Feito com <CarviWordmark className="text-xs" /> · carvi.online
        </p>
      </div>
    </div>
  );
}
