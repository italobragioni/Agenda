import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { requireActiveBusiness } from "@/features/billing/guard";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkNotificationsSeen } from "@/features/notifications/notification-bell";
import { EnablePush } from "@/features/notifications/enable-push";
import { formatCents } from "@/lib/money";
import { formatDateTimeBR } from "@/lib/datetime";
import type { Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Notificações — Carvi" };

export default async function NotificacoesPage() {
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");
  const tz = ctx.business.timezone;

  const supabase = await createClient();
  // Agendamentos feitos online (pelo cliente), mais recentes primeiro.
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("booking_source", "public")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (data ?? []) as Appointment[];
  const latest = items[0]?.created_at ?? new Date().toISOString();

  return (
    <div className="mx-auto max-w-2xl">
      {/* Marca tudo como visto ao abrir a página. */}
      <MarkNotificationsSeen latest={latest} />

      <Link
        href="/agenda"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Agenda
      </Link>

      <PageHeader
        title="Notificações"
        description="Agendamentos feitos pelos clientes online."
      />

      <div className="mb-5">
        <EnablePush />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="Nenhum agendamento online ainda"
          description="Quando um cliente marcar pelo seu link, aparece aqui."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {a.customer_name_snapshot}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {a.service_name_snapshot} · {formatCents(a.price_cents)}
                    </p>
                    {a.notes && (
                      <p className="truncate text-xs text-muted">{a.notes}</p>
                    )}
                    <p className="mt-0.5 text-xs text-muted">
                      Para {formatDateTimeBR(a.start_at, tz)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">
                    online
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
