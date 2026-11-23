import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Camera, FileDown } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  listAppointmentPhotos,
  type AppointmentPhoto,
} from "@/features/appointments/photo-actions";
import { EstablishmentLogo, CarviLogo } from "@/components/brand/logo";
import { formatDateBR } from "@/lib/datetime";

function PhotoGrid({ photos }: { photos: AppointmentPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((p) => (
        <a
          key={p.path}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square overflow-hidden rounded-xl border border-border bg-slate-50"
        >
          <Image
            src={p.url}
            alt="Foto do atendimento"
            fill
            unoptimized
            className="object-cover"
          />
        </a>
      ))}
    </div>
  );
}

export const metadata: Metadata = { title: "Fotos do atendimento" };

export default async function PublicPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: appt } = await admin
    .from("appointments")
    .select("id, business_id, customer_name_snapshot, service_name_snapshot, start_at")
    .eq("id", id)
    .maybeSingle();
  if (!appt) notFound();

  const { data: business } = await admin
    .from("businesses")
    .select("name, logo_url, timezone")
    .eq("id", appt.business_id as string)
    .maybeSingle();
  if (!business) notFound();

  const tz = (business.timezone as string) ?? "America/Sao_Paulo";
  const photos = await listAppointmentPhotos(
    appt.business_id as string,
    id,
  );
  const total = photos.antes.length + photos.depois.length + photos.outras.length;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6 text-center">
        {business.logo_url ? (
          <EstablishmentLogo
            logoUrl={business.logo_url as string}
            className="mx-auto mb-3 h-16 max-w-[180px]"
          />
        ) : null}
        <h1 className="text-xl font-semibold text-foreground">
          {business.name as string}
        </h1>
        <p className="mt-1 text-sm text-muted">Fotos do seu atendimento</p>
      </div>

      <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-center">
        <p className="text-sm font-semibold text-foreground">
          {appt.customer_name_snapshot as string}
        </p>
        <p className="text-xs text-muted">
          {appt.service_name_snapshot as string}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDateBR(appt.start_at as string, tz)}
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center">
          <Camera className="mx-auto mb-2 h-7 w-7 text-muted" aria-hidden />
          <p className="text-sm text-muted">
            Ainda não há fotos para este atendimento.
          </p>
        </div>
      ) : (
        <>
          <a
            href={`/f/${id}/pdf?download=1`}
            className="tap mb-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            Baixar tudo em PDF
          </a>

          {photos.antes.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Antes do serviço
              </h2>
              <PhotoGrid photos={photos.antes} />
            </section>
          )}
          {photos.depois.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Depois do serviço
              </h2>
              <PhotoGrid photos={photos.depois} />
            </section>
          )}
          {photos.outras.length > 0 && (
            <section className="mb-5">
              <h2 className="mb-2 text-sm font-semibold text-foreground">Fotos</h2>
              <PhotoGrid photos={photos.outras} />
            </section>
          )}

          <p className="text-center text-xs text-muted">
            Toque em uma foto para ver maior ou baixar.
          </p>
        </>
      )}

      <footer className="mt-8 flex items-center justify-center gap-2 text-xs text-muted">
        Feito com <CarviLogo className="h-5" transparent />
      </footer>
    </main>
  );
}
