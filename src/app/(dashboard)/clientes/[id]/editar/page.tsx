import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireActiveBusiness } from "@/features/billing/guard";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { CustomerForm } from "@/features/customers/customer-form";
import { updateCustomer } from "@/features/customers/actions";
import { formatPhone } from "@/lib/phone";
import type { Customer } from "@/types/database";

export const metadata: Metadata = { title: "Editar cliente — Agenda" };

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const customer = data as Customer;

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Editar cliente" />
      <Card>
        <CustomerForm
          action={updateCustomer.bind(null, id)}
          defaultValues={{
            name: customer.name,
            phone: formatPhone(customer.phone),
            vehicle: customer.vehicle ?? "",
          }}
          submitLabel="Salvar alterações"
          cancelHref={`/clientes/${id}`}
        />
      </Card>
    </div>
  );
}
