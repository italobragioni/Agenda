import type { Metadata } from "next";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Agenda — Agenda" };

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Agenda"
        description="Seus agendamentos por dia, semana e calendário."
      />
      <EmptyState
        icon={Calendar}
        title="Em construção"
        description="A visualização completa da agenda será entregue na Fase 6."
        action={
          <Link href="/agenda/novo">
            <Button>Novo agendamento</Button>
          </Link>
        }
      />
    </div>
  );
}
