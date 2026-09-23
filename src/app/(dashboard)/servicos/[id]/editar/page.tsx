import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/services/service-form";
import { updateService } from "@/features/services/actions";
import type { Service } from "@/types/database";

export const metadata: Metadata = { title: "Editar serviço — Agenda" };

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const service = data as Service;

  const priceStr = (service.price_cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Editar serviço" />
      <Card>
        <ServiceForm
          action={updateService.bind(null, id)}
          defaultValues={{
            name: service.name,
            description: service.description ?? "",
            price: priceStr,
            duration_minutes: String(service.duration_minutes),
            is_active: service.is_active,
          }}
          submitLabel="Salvar alterações"
        />
      </Card>
    </div>
  );
}
