"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { ImageUp, Trash2 } from "lucide-react";
import { uploadLogo, removeLogo } from "./logo-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

export function LogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [state, action] = useActionState(uploadLogo, {} as ActionState);
  const [fileName, setFileName] = useState<string>("");

  return (
    <div className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      {logoUrl ? (
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
            <Image
              src={logoUrl}
              alt="Logo atual"
              width={200}
              height={120}
              className="h-full w-auto object-contain"
              unoptimized
            />
          </div>
          <form action={removeLogo}>
            <button
              type="submit"
              className="tap inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          </form>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Nenhuma logo enviada. Sua logo aparecerá no topo da página pública de
          agendamento.
        </p>
      )}

      <form action={action} className="space-y-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted hover:bg-slate-50">
          <ImageUp className="h-5 w-5" />
          <span className="flex-1 truncate">
            {fileName || "Escolher imagem (PNG, JPG, WEBP ou SVG · até 2 MB)"}
          </span>
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
        <SubmitButton pendingText="Enviando...">Salvar logo</SubmitButton>
      </form>
    </div>
  );
}
