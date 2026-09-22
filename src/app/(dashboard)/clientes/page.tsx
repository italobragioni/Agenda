import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Clientes — Agenda" };

export default function ClientesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Clientes"
        description="Histórico e contato dos seus clientes."
      />
      <EmptyState
        icon={Users}
        title="Em construção"
        description="A lista de clientes com busca e histórico virá na Fase 5."
      />
    </div>
  );
}
