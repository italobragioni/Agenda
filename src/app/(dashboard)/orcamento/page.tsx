import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireOwner } from "@/features/billing/guard";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { QuoteBuilder } from "@/features/quote/quote-builder";
import { QuoteHistory } from "@/features/quote/quote-history";
import type { Quote } from "@/types/database";

export const metadata: Metadata = { title: "Orçamento — Carvi" };

export default async function OrcamentoPage() {
  const ctx = await requireOwner();
  if (!ctx) redirect("/login");

  const supabase = await createClient();

  // Serviços ativos para o atalho de preenchimento.
  const { data: servicesData } = await supabase
    .from("services")
    .select("id, name, price_cents")
    .eq("business_id", ctx.business.id)
    .eq("is_active", true)
    .order("name", { ascending: true });
  const services = (servicesData ?? []) as {
    id: string;
    name: string;
    price_cents: number;
  }[];

  // Orçamentos salvos (resiliente: se a tabela ainda não existir, fica vazio).
  let quotes: Quote[] = [];
  const quotesRes = await supabase
    .from("quotes")
    .select("*")
    .eq("business_id", ctx.business.id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (!quotesRes.error) quotes = (quotesRes.data ?? []) as Quote[];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Orçamento"
        description="Monte um orçamento com os itens que quiser e envie pronto no WhatsApp."
      />
      <QuoteBuilder businessName={ctx.business.name} services={services} />
      <QuoteHistory
        quotes={quotes}
        businessName={ctx.business.name}
        tz={ctx.business.timezone}
      />
    </div>
  );
}
