import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Novo agendamento — Agenda" };

export default function NovoAgendamentoPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Novo agendamento" />
      <EmptyState
        icon={CalendarPlus}
        title="Em construção"
        description="A criação de agendamentos pelo proprietário virá na Fase 6, depois que cadastrarmos serviços e clientes."
        action={
          <Link href="/inicio">
            <Button variant="secondary">Voltar ao início</Button>
          </Link>
        }
      />
    </div>
  );
}
