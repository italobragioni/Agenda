import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Configurações — Agenda" };

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Configurações"
        description="Dados do negócio, horários e link de agendamento."
      />
      <EmptyState
        icon={Settings}
        title="Em construção"
        description="As configurações completas virão na Fase 10."
      />
    </div>
  );
}
