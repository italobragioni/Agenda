"use client";

import { useActionState } from "react";
import { updateCapacity } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

export function CapacityForm({ value }: { value: number }) {
  const [state, action] = useActionState(updateCapacity, {} as ActionState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <FormField
        label="Atendimentos ao mesmo tempo"
        htmlFor="capacity"
        hint="Quantos carros você consegue atender simultaneamente (ex.: nº de boxes)."
      >
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          max={50}
          inputMode="numeric"
          defaultValue={value}
          className="max-w-[120px]"
          required
        />
      </FormField>

      <SubmitButton pendingText="Salvando...">Salvar</SubmitButton>
    </form>
  );
}
