import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBusiness } from "@/features/public-booking/data";
import { PublicBooking } from "@/features/public-booking/public-booking";

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
    </main>
  );
}
