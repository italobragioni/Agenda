import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, ChevronRight } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { formatCents } from "@/lib/money";
import { formatPhone, onlyDigits } from "@/lib/phone";
import { formatDateBR } from "@/lib/datetime";
import { buildCustomerStats, getStats } from "@/features/customers/stats";
import type { Customer, Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Clientes — Agenda" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const tz = ctx.business.timezone;

  const supabase = await createClient();
  const [{ data: customersData }, { data: apptsData }] = await Promise.all([
    supabase.from("customers").select("*").order("name"),
    supabase
      .from("appointments")
      .select("customer_id,status,price_cents,start_at"),
  ]);

  let customers = (customersData ?? []) as Customer[];

  // Busca por nome ou telefone (feita no servidor, em memória).
  if (query) {
    const qLower = query.toLowerCase();
    const qDigits = onlyDigits(query);
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(qLower) ||
        (qDigits.length > 0 && onlyDigits(c.phone).includes(qDigits)),
    );
  }

  const stats = buildCustomerStats(
    (apptsData ?? []) as Pick<
      Appointment,
      "customer_id" | "status" | "price_cents" | "start_at"
    >[],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Clientes"
        description="Histórico e contato dos seus clientes."
      />

      <SearchInput
        action="/clientes"
        defaultValue={query}
        placeholder="Buscar por nome ou telefone"
      />

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          description={
            query
              ? "Tente outro nome ou telefone."
              : "Os clientes aparecem aqui automaticamente quando você cria agendamentos."
          }
        />
      ) : (
        <ul className="space-y-2">
          {customers.map((c) => {
            const s = getStats(stats, c.id);
            return (
              <li key={c.id}>
                <Link href={`/clientes/${c.id}`}>
                  <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {formatPhone(c.phone)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {s.completedCount}{" "}
                        {s.completedCount === 1 ? "atendimento" : "atendimentos"}
                        {" · "}
                        {formatCents(s.totalSpentCents)}
                        {s.lastVisitAt && (
                          <> · último em {formatDateBR(s.lastVisitAt, tz)}</>
                        )}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted"
                      aria-hidden
                    />
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
