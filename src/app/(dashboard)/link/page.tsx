import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/features/auth/current";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkForm } from "@/features/settings/link-form";

export const metadata: Metadata = { title: "Link de agendamento — Carvi" };

export default async function LinkPage() {
  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Link de agendamento"
        description="Compartilhe este link para seus clientes agendarem sozinhos."
      />
      <Card>
        <LinkForm siteUrl={siteUrl} slug={ctx.business.slug} />
      </Card>
    </div>
  );
}
