import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveBusiness } from "@/features/billing/guard";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { CustomerForm } from "@/features/customers/customer-form";

export const metadata: Metadata = { title: "Novo cliente — Agenda" };

export default async function NovoClientePage() {
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Novo cliente" />
      <Card>
        <CustomerForm />
      </Card>
    </div>
  );
}
