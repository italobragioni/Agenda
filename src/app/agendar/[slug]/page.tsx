import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
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
        businessLogoUrl={data.business.logo_url}
        businessWhatsapp={data.business.whatsapp}
        services={data.services}
        days={data.days}
        tz={data.business.timezone}
      />

      {data.business.address && (
        <section className="mx-auto w-full max-w-md px-4 pb-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <MapPin className="h-4 w-4 text-brand" aria-hidden /> Onde estamos
          </h2>
          <p className="mb-3 text-sm text-muted">{data.business.address}</p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Mapa"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                data.business.address,
              )}&output=embed`}
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              data.business.address,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tap mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50"
          >
            <MapPin className="h-4 w-4" aria-hidden /> Como chegar
          </a>
        </section>
      )}

      <footer className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
        Agendamento por <CarviLogo className="h-6" transparent />
      </footer>
    </main>
  );
}
