import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { requireActiveBusiness } from "@/features/billing/guard";
import { capabilitiesFor, maxServicesFor, PLANS } from "@/features/billing/plan";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/features/services/service-form";
import { createService } from "@/features/services/actions";

export const metadata: Metadata = { title: "Novo serviço — Agenda" };

export default async function NovoServicoPage() {
  const ctx = await requireActiveBusiness();
  if (!ctx) redirect("/login");

  // Limite de serviços do plano atingido? Bloqueia com mensagem clara.
  const maxServices = maxServicesFor(ctx.business.plan);
  if (maxServices !== null) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("business_id", ctx.business.id);
    if ((count ?? 0) >= maxServices) {
      const planName =
        ctx.business.plan === "basic" ? PLANS.basic.name : PLANS.premium.name;
      return (
        <div className="mx-auto max-w-lg">
          <PageHeader title="Novo serviço" />
          <Card className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Lock className="h-6 w-6" aria-hidden />
            </span>
            <p className="mt-4 text-sm text-foreground">
              Seu plano {planName} permite até {maxServices} serviços e você já
              atingiu esse limite. Faça upgrade para cadastrar mais serviços.
            </p>
            <Link href="/assinatura" className="mt-5 inline-block">
              <Button>Ver planos</Button>
            </Link>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Novo serviço" />
      <Card>
        <ServiceForm
          action={createService}
          submitLabel="Cadastrar serviço"
          showVehiclePricing={capabilitiesFor(ctx.business).vehiclePricing}
        />
      </Card>
    </div>
  );
}
