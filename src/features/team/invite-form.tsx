"use client";

import { useActionState } from "react";
import { inviteMember } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

export function InviteForm() {
  const [state, action] = useActionState(inviteMember, {} as ActionState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <FormField label="Nome do funcionário" htmlFor="full_name" error={fe.full_name}>
        <Input id="full_name" name="full_name" autoComplete="off" required />
      </FormField>

      <FormField label="E-mail de acesso" htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="off" required />
      </FormField>

      <FormField
        label="Senha"
        htmlFor="password"
        error={fe.password}
        hint="Mínimo de 6 caracteres. Repasse ao funcionário."
      >
        <Input
          id="password"
          name="password"
          type="text"
          autoComplete="off"
          required
        />
      </FormField>

      <SubmitButton fullWidth pendingText="Criando acesso...">
        Adicionar à equipe
      </SubmitButton>
    </form>
  );
}
