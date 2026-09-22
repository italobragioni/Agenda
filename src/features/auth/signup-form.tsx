"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type ActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const initial: ActionState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initial);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">
          Comece a organizar sua agenda em minutos.
        </p>
      </div>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormField label="Seu nome" htmlFor="ownerName" error={fe.ownerName}>
        <Input id="ownerName" name="ownerName" autoComplete="name" required />
      </FormField>

      <FormField
        label="Nome do estabelecimento"
        htmlFor="businessName"
        error={fe.businessName}
      >
        <Input
          id="businessName"
          name="businessName"
          placeholder="Ex.: Estética Premium"
          required
        />
      </FormField>

      <FormField
        label="Telefone / WhatsApp"
        htmlFor="phone"
        error={fe.phone}
        hint="Com DDD. Ex.: (31) 99999-9999"
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
        />
      </FormField>

      <FormField label="E-mail" htmlFor="email" error={fe.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField
        label="Senha"
        htmlFor="password"
        error={fe.password}
        hint="Mínimo de 6 caracteres."
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>

      <SubmitButton fullWidth size="lg" pendingText="Criando conta...">
        Criar conta
      </SubmitButton>

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
