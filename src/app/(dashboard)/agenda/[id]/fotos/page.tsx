import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentContext } from "@/features/auth/current";
import { createClient } from "@/lib/supabase/server";
import {
  listAppointmentPhotos,
} from "@/features/appointments/photo-actions";
import { AppointmentPhotos } from "@/features/appointments/appointment-photos";
import { PageHeader } from "@/components/ui/page-header";
import { formatCents } from "@/lib/money";
import { formatDateTimeBR } from "@/lib/datetime";
import type { Appointment } from "@/types/database";

export const metadata: Metadata = { title: "Fotos do veículo — Carvi" };

export default async function AppointmentPhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await getCurrentContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  // RLS garante que só vem atendimento do próprio estabelecimento.
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const appt = data as Appointment;

  const tz = ctx.business.timezone;
  const photos = await listAppointmentPhotos(ctx.business.id, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/agenda"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para a agenda
      </Link>

      <PageHeader title="Fotos do veículo" />

      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">
          {appt.customer_name_snapshot}
        </p>
        <p className="text-xs text-muted">
          {appt.service_name_snapshot} · {formatCents(appt.price_cents)}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatDateTimeBR(appt.start_at, tz)}
        </p>
      </div>

      <AppointmentPhotos appointmentId={id} photos={photos} />
    </div>
  );
}
