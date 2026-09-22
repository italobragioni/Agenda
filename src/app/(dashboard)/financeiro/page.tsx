import type { Metadata } from "next";
import { DollarSign } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Financeiro — Agenda" };

export default function FinanceiroPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Financeiro"
        description="Faturamento e serviços realizados."
      />
      <EmptyState
        icon={DollarSign}
        title="Em construção"
        description="Os relatórios de faturamento virão na Fase 9."
      />
    </div>
  );
}
