"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [state, action] = useActionState(updatePix, {} as ActionState);

  const [enabled, setEnabled] = useState(Boolean(pixKey));
  const [key, setKey] = useState(pixKey ?? "");
  const [name, setName] = useState(pixName ?? "");
  const [city, setCity] = useState(pixCity ?? "");

  // Re-sincroniza com o que está salvo no banco (depois de salvar/recarregar).
  const signature = `${pixKey ?? ""}|${pixName ?? ""}|${pixCity ?? ""}`;
  useEffect(() => {
    setEnabled(Boolean(pixKey));
    setKey(pixKey ?? "");
    setName(pixName ?? "");
    setCity(pixCity ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // Após salvar com sucesso, busca os dados novos do servidor.
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state, router]);

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
            value={key}
            onChange={(e) => setKey(e.target.value)}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
