"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Trash2, Loader2 } from "lucide-react";
import {
  uploadAppointmentPhotos,
  removeAppointmentPhoto,
  type AppointmentPhoto,
  type GroupedPhotos,
  type PhotoPhase,
} from "./photo-actions";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

const PICKER =
  "tap flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors";

function PhotoGrid({
  appointmentId,
  photos,
}: {
  appointmentId: string;
  photos: AppointmentPhoto[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p) => (
        <div
          key={p.path}
          className="relative aspect-square overflow-hidden rounded-xl border border-border bg-slate-50"
        >
          <a href={p.url} target="_blank" rel="noopener noreferrer">
            <Image
              src={p.url}
              alt="Foto do veículo"
              fill
              unoptimized
              className="object-cover"
            />
          </a>
          <form
            action={removeAppointmentPhoto.bind(null, appointmentId, p.path)}
            className="absolute right-1 top-1"
          >
            <button
              type="submit"
              aria-label="Remover foto"
              className="tap flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white hover:bg-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

function PhaseSection({
  appointmentId,
  phase,
  title,
  photos,
}: {
  appointmentId: string;
  phase: PhotoPhase;
  title: string;
  photos: AppointmentPhoto[];
}) {
  const action = uploadAppointmentPhotos.bind(null, appointmentId, phase);
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const submitNow = () => formRef.current?.requestSubmit();

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted">
          {photos.length} {photos.length === 1 ? "foto" : "fotos"}
        </span>
      </div>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-3">
        <label className={`${PICKER} bg-brand text-brand-foreground hover:bg-brand-hover`}>
          <Camera className="h-5 w-5" aria-hidden />
          Tirar foto
          <input
            type="file"
            name="photos"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={submitNow}
          />
        </label>
        <label className={`${PICKER} border border-border bg-card text-foreground hover:bg-slate-50`}>
          <ImagePlus className="h-5 w-5" aria-hidden />
          Escolher
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            className="hidden"
            onChange={submitNow}
          />
        </label>
      </form>

      {pending && (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Enviando...
        </p>
      )}

      {photos.length > 0 && (
        <div className="mt-3">
          <PhotoGrid appointmentId={appointmentId} photos={photos} />
        </div>
      )}
    </div>
  );
}

export function AppointmentPhotos({
  appointmentId,
  photos,
}: {
  appointmentId: string;
  photos: GroupedPhotos;
}) {
  return (
    <div className="space-y-4">
      <PhaseSection
        appointmentId={appointmentId}
        phase="antes"
        title="Antes do serviço"
        photos={photos.antes}
      />
      <PhaseSection
        appointmentId={appointmentId}
        phase="depois"
        title="Depois do serviço"
        photos={photos.depois}
      />

      {photos.outras.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Outras fotos
          </h3>
          <PhotoGrid appointmentId={appointmentId} photos={photos.outras} />
        </div>
      )}
    </div>
  );
}
