"use client";

import { useActionState } from "react";
import { updateInterval } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/forms";

const OPTIONS = [0, 10, 15, 30];

export function IntervalForm({ value }: { value: number }) {
  const [state, action] = useActionState(updateInterval, {} as ActionState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <div>
        <Label htmlFor="interval">Intervalo entre clientes</Label>
        <select
          id="interval"
          name="interval"
          defaultValue={String(value)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground focus:border-brand focus:outline-2 focus:outline-brand"
        >
          {OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o === 0 ? "Sem intervalo" : `${o} minutos`}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          Folga aplicada entre um atendimento e o próximo.
        </p>
      </div>

      <SubmitButton pendingText="Salvando...">Salvar</SubmitButton>
    </form>
  );
}
