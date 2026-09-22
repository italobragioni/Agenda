import type { Metadata } from "next";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Serviços — Agenda" };

export default function ServicosPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Serviços"
        description="Os serviços que você oferece, com preço e duração."
      />
      <EmptyState
        icon={Wrench}
        title="Em construção"
        description="O cadastro de serviços virá na próxima etapa (Fase 4)."
      />
    </div>
  );
}
