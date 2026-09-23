import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_INFO } from "./status";
import { AppointmentActions } from "./appointment-actions";
import { formatCents } from "@/lib/money";
import { formatTimeBR } from "@/lib/datetime";
import { whatsappLink } from "@/lib/phone";
import { MessageCircle } from "lucide-react";
import type { Appointment } from "@/types/database";

/** Item de agendamento usado na Agenda (com ações de status). */
export function AppointmentItem({
  appointment: a,
  tz,
}: {
  appointment: Appointment;
  tz: string;
}) {
  const dimmed = a.status === "cancelled" || a.status === "no_show";

  return (
    <Card className={dimmed ? "p-4 opacity-60" : "p-4"}>
      <div className="flex items-start gap-3">
        <div className="w-12 shrink-0 text-center">
          <p className="text-sm font-semibold text-foreground">
            {formatTimeBR(a.start_at, tz)}
          </p>
          <p className="text-[11px] text-muted">
            {formatTimeBR(a.end_at, tz)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {a.customer_name_snapshot}
          </p>
          <p className="truncate text-xs text-muted">
            {a.service_name_snapshot} · {formatCents(a.price_cents)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Badge className={STATUS_INFO[a.status].badgeClass}>
              {STATUS_INFO[a.status].label}
            </Badge>
            <a
              href={whatsappLink(a.customer_phone_snapshot)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chamar no WhatsApp"
              className="text-green-600 hover:text-green-700"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href={`/clientes/${a.customer_id ?? ""}`}
          className="text-xs text-muted hover:text-foreground"
        >
          Ver cliente
        </Link>
        <AppointmentActions id={a.id} status={a.status} />
      </div>
    </Card>
  );
}
