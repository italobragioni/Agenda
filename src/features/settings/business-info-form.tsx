"use client";

import { useActionState } from "react";
import { updateBusinessInfo } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { formatPhone } from "@/lib/phone";
import type { ActionState } from "@/lib/forms";

export function BusinessInfoForm({
  name,
  phone,
  whatsapp,
  address,
}: {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
}) {
  const [state, action] = useActionState(updateBusinessInfo, {} as ActionState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <FormField label="Nome do estabelecimento" htmlFor="name" error={fe.name}>
        <Input id="name" name="name" defaultValue={name} required />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Telefone" htmlFor="phone" error={fe.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={phone ? formatPhone(phone) : ""}
            placeholder="(31) 3333-4444"
          />
        </FormField>
        <FormField label="WhatsApp" htmlFor="whatsapp" error={fe.whatsapp}>
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            defaultValue={whatsapp ? formatPhone(whatsapp) : ""}
            placeholder="(31) 99999-9999"
          />
        </FormField>
      </div>

      <FormField
        label="Endereço"
        htmlFor="address"
        error={fe.address}
        hint="Aparece com um mapa na sua página de agendamento."
      >
        <Input
          id="address"
          name="address"
          defaultValue={address ?? ""}
          placeholder="Rua, número, bairro, cidade"
        />
      </FormField>

      <SubmitButton pendingText="Salvando...">Salvar</SubmitButton>
    </form>
  );
}
