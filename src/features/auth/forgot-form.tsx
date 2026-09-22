"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type ActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export function ForgotForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initial);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Esqueci minha senha
        </h1>
        <p className="mt-1 text-sm text-muted">
          Enviaremos um link para você criar uma nova senha.
        </p>
      </div>

      {state.success && <Alert tone="success">{state.success}</Alert>}

      <FormField label="E-mail" htmlFor="email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>

      <SubmitButton fullWidth size="lg" pendingText="Enviando...">
        Enviar link
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}
