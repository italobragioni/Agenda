"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCustomer } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

export interface CustomerFormValues {
  name: string;
  phone: string;
  vehicle: string;
}

const empty: CustomerFormValues = { name: "", phone: "", vehicle: "" };

export function CustomerForm({
  action = createCustomer,
  defaultValues = empty,
  submitLabel = "Salvar cliente",
  cancelHref = "/clientes",
}: {
  action?: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: CustomerFormValues;
  submitLabel?: string;
  cancelHref?: string;
}) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormField label="Nome" htmlFor="name" error={fe.name}>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues.name}
          placeholder="Ex.: João da Silva"
          autoComplete="name"
          required
        />
      </FormField>

      <FormField label="Celular (WhatsApp)" htmlFor="phone" error={fe.phone}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={defaultValues.phone}
          placeholder="Ex.: (31) 99999-9999"
          autoComplete="tel"
          required
        />
      </FormField>

      <FormField label="Carro (opcional)" htmlFor="vehicle" error={fe.vehicle}>
        <Input
          id="vehicle"
          name="vehicle"
          defaultValue={defaultValues.vehicle}
          placeholder="Ex.: Gol prata"
        />
      </FormField>

      <div className="flex gap-3 pt-2">
        <SubmitButton pendingText="Salvando...">{submitLabel}</SubmitButton>
        <Link href={cancelHref}>
          <Button variant="secondary" type="button">
            Cancelar
          </Button>
        </Link>
      </div>
    </form>
  );
}
