"use client";

import { useActionState, useState } from "react";
import { updatePix } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/forms";

export function PixForm({
  pixKey,
  pixName,
  pixCity,
}: {
  pixKey: string | null;
  pixName: string | null;
  pixCity: string | null;
}) {
  const [state, action] = useActionState(updatePix, {} as ActionState);
  const [enabled, setEnabled] = useState(Boolean(pixKey));

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <p className="text-sm text-muted">
        Quando o cliente conclui o agendamento, aparece a sua chave Pix já com o
        valor para ele copiar e pagar (com QR Code também).
      </p>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="pix_enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 rounded border-border accent-[var(--brand)]"
        />
        <span className="text-sm font-medium text-foreground">
          Mostrar Pix ao agendar
        </span>
      </label>

      <div
        className={cn(
          "space-y-3",
          !enabled && "pointer-events-none opacity-40",
        )}
      >
        <div>
          <label
            htmlFor="pix_key"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Chave Pix
          </label>
          <input
            id="pix_key"
            name="pix_key"
            defaultValue={pixKey ?? ""}
            disabled={!enabled}
            placeholder="CPF, CNPJ, celular, e-mail ou chave aleatória"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
          />
          {state.fieldErrors?.pix_key && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.pix_key}
            </p>
          )}
          <p className="mt-1 text-xs text-muted">
            Digite igual aparece no seu banco. Para celular, inclua +55 (ex.:
            +5531999998888).
          </p>
        </div>

        <div>
          <label
            htmlFor="pix_name"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Nome do recebedor
          </label>
          <input
            id="pix_name"
            name="pix_name"
            defaultValue={pixName ?? ""}
            disabled={!enabled}
            placeholder="Ex.: João da Silva"
            maxLength={25}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
          />
          {state.fieldErrors?.pix_name && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.pix_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="pix_city"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Cidade
          </label>
          <input
            id="pix_city"
            name="pix_city"
            defaultValue={pixCity ?? ""}
            disabled={!enabled}
            placeholder="Ex.: Belo Horizonte"
            maxLength={15}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
          />
          {state.fieldErrors?.pix_city && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.pix_city}
            </p>
          )}
        </div>
      </div>

      <SubmitButton pendingText="Salvando...">Salvar Pix</SubmitButton>
    </form>
  );
}
