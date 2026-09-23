import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Wrench, Plus, Clock, Pencil } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveToggle } from "@/features/services/active-toggle";
import { formatCents } from "@/lib/money";
import type { Service } from "@/types/database";

export const metadata: Metadata = { title: "Serviços — Agenda" };

export default async function ServicosPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  const services = (data ?? []) as Service[];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Serviços"
        description="Adicione os serviços que você oferece."
        action={
          <Link href="/servicos/novo">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Novo serviço</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nenhum serviço cadastrado"
          description="Cadastre seu primeiro serviço com nome, preço e duração."
          action={
            <Link href="/servicos/novo">
              <Button>Cadastrar serviço</Button>
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {services.map((s) => (
            <li key={s.id}>
              <Card className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.name}
                    {!s.is_active && (
                      <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-muted">
                        inativo
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-foreground">
                      {formatCents(s.price_cents)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden />
                      {s.duration_minutes} min
                    </span>
                  </p>
                </div>

                <ActiveToggle id={s.id} isActive={s.is_active} />

                <Link
                  href={`/servicos/${s.id}/editar`}
                  aria-label={`Editar ${s.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
