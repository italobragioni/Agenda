import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireActiveBusiness } from "@/features/billing/guard";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/features/services/service-form";
import { updateService } from "@/features/services/actions";
import { capabilitiesFor } from "@/features/billing/plan";
import type { Service } from "@/types/database";

export const metadata: Metadata = { title: "Editar serviço — Agenda" };

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const service = data as Service;

  const centsToStr = (c: number | null | undefined) =>
    typeof c === "number"
      ? (c / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Editar serviço" />
      <Card>
        <ServiceForm
          action={updateService.bind(null, id)}
          defaultValues={{
            name: service.name,
            description: service.description ?? "",
            price: centsToStr(service.price_cents),
            priceHatch: centsToStr(service.price_hatch_cents),
            priceSedan: centsToStr(service.price_sedan_cents),
            priceSuv: centsToStr(service.price_suv_cents),
            priceCaminhonete: centsToStr(service.price_caminhonete_cents),
            duration_minutes: String(service.duration_minutes),
            is_active: service.is_active,
          }}
          submitLabel="Salvar alterações"
          showVehiclePricing={capabilitiesFor(ctx.business).vehiclePricing}
        />
      </Card>
    </div>
  );
}
