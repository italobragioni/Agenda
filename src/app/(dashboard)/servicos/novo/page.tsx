import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/services/service-form";
import { createService } from "@/features/services/actions";

export const metadata: Metadata = { title: "Novo serviço — Agenda" };

export default function NovoServicoPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Novo serviço" />
      <Card>
        <ServiceForm action={createService} submitLabel="Cadastrar serviço" />
      </Card>
    </div>
  );
}
