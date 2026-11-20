import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireOwner } from "@/features/billing/guard";
import { PageHeader } from "@/components/ui/page-header";
import { QuoteBuilder } from "@/features/quote/quote-builder";

export const metadata: Metadata = { title: "Orçamento — Carvi" };

export default async function OrcamentoPage() {
  const ctx = await requireOwner();
  if (!ctx) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Orçamento"
        description="Monte um orçamento com os itens que quiser e envie pronto no WhatsApp."
      />
      <QuoteBuilder businessName={ctx.business.name} />
    </div>
  );
}
