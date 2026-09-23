import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBusiness } from "@/features/public-booking/data";
import { PublicBooking } from "@/features/public-booking/public-booking";
import { CarviLogo } from "@/components/brand/logo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicBusiness(slug);
  return {
    title: data ? `Agendar — ${data.business.name}` : "Agendamento",
    description: data
      ? `Agende seu horário em ${data.business.name}.`
      : undefined,
  };
}

export default async function AgendarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicBusiness(slug);
  if (!data) notFound();

  if (!data.active) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            {data.business.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Os agendamentos online estão temporariamente indisponíveis. Entre em
            contato diretamente com o estabelecimento.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <PublicBooking
        slug={data.business.slug}
        businessName={data.business.name}
        businessWhatsapp={data.business.whatsapp}
        services={data.services}
        days={data.days}
        tz={data.business.timezone}
      />
      <footer className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
        Agendamento por <CarviLogo className="h-6" />
      </footer>
    </main>
  );
}
