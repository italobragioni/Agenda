"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type ActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(login, initial);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Entrar</h1>
        <p className="mt-1 text-sm text-muted">Acesse a sua agenda.</p>
      </div>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormField label="E-mail" htmlFor="email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField label="Senha" htmlFor="password" error={fe.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      <div className="text-right">
        <Link
          href="/esqueci-senha"
          className="text-sm font-medium text-brand hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <SubmitButton fullWidth size="lg" pendingText="Entrando...">
        Entrar
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-brand hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
