"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Trash2, Loader2 } from "lucide-react";
import {
  uploadAppointmentPhotos,
  removeAppointmentPhoto,
  type AppointmentPhoto,
} from "./photo-actions";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

const PICKER =
  "tap flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors";

export function AppointmentPhotos({
  appointmentId,
  photos,
}: {
  appointmentId: string;
  photos: AppointmentPhoto[];
}) {
  const action = uploadAppointmentPhotos.bind(null, appointmentId);
  const [state, formAction, pending] = useActionState(
    action,
    {} as ActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Envia assim que a pessoa tira a foto / escolhe as imagens.
  const submitNow = () => formRef.current?.requestSubmit();

  return (
    <div className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <form ref={formRef} action={formAction} className="grid grid-cols-2 gap-3">
        <label
          className={`${PICKER} bg-brand text-brand-foreground hover:bg-brand-hover`}
        >
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

        <label
          className={`${PICKER} border border-border bg-card text-foreground hover:bg-slate-50`}
        >
          <ImagePlus className="h-5 w-5" aria-hidden />
          Escolher fotos
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
        <p className="flex items-center justify-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Enviando fotos...
        </p>
      )}

      {photos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted">
          Nenhuma foto ainda. Registre o veículo (antes e depois do serviço)
          tocando em <strong>Tirar foto</strong>.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div
              key={p.name}
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
                action={removeAppointmentPhoto.bind(null, appointmentId, p.name)}
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
      )}
    </div>
  );
}
