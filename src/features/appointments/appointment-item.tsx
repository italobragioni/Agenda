import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_INFO } from "./status";
import { AppointmentActions } from "./appointment-actions";
import { formatCents } from "@/lib/money";
import { formatTimeBR } from "@/lib/datetime";
import { whatsappLink, formatPhone } from "@/lib/phone";
import { receiptMessage } from "@/lib/receipt";
import { MessageCircle, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/database";

/** Item de agendamento usado na Agenda (com ações de status). */
export function AppointmentItem({
  appointment: a,
  tz,
  businessName,
}: {
  appointment: Appointment;
  tz: string;
  businessName: string;
}) {
  const dimmed = a.status === "cancelled" || a.status === "no_show";
  const phone = a.customer_phone_snapshot;

  return (
    <Card className={cn("p-4", dimmed && "opacity-60")}>
      {/* Cabeçalho: horário · cliente/serviço · status */}
      <div className="flex items-start gap-3">
        <div className="w-12 shrink-0 text-center">
          <p className="text-sm font-semibold text-foreground">
            {formatTimeBR(a.start_at, tz)}
          </p>
          <p className="text-[11px] text-muted">{formatTimeBR(a.end_at, tz)}</p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {a.customer_name_snapshot}
          </p>
          <p className="truncate text-xs text-muted">
            {a.service_name_snapshot} · {formatCents(a.price_cents)}
          </p>
          {a.notes && <p className="truncate text-xs text-muted">{a.notes}</p>}
        </div>

        <Badge className={cn("shrink-0", STATUS_INFO[a.status].badgeClass)}>
          {STATUS_INFO[a.status].label}
        </Badge>
      </div>

      {/* Contato */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        {phone ? (
          <a
            href={whatsappLink(phone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chamar ${a.customer_name_snapshot} no WhatsApp`}
            className="inline-flex min-w-0 items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700"
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{formatPhone(phone)}</span>
          </a>
        ) : (
          <span className="text-xs text-muted">Sem telefone</span>
        )}

        <Link
          href={`/clientes/${a.customer_id ?? ""}`}
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted hover:text-foreground"
        >
          <User className="h-3.5 w-3.5" aria-hidden />
          Ver cliente
        </Link>
      </div>

      {/* Ações (ocultas em cancelado/não compareceu) */}
      {!dimmed && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {phone && (
            <a
              href={whatsappLink(
                phone,
                receiptMessage({
                  businessName,
                  customerName: a.customer_name_snapshot,
                  serviceName: a.service_name_snapshot,
                  notes: a.notes,
                  startAtIso: a.start_at,
                  tz,
                  priceCents: a.price_cents,
                }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-slate-50"
            >
              <Receipt className="h-3.5 w-3.5" aria-hidden />
              Recibo
            </a>
          )}
          <AppointmentActions id={a.id} status={a.status} />
        </div>
      )}
    </Card>
  );
}
