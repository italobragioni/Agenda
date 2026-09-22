"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/validation/auth";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  // Ao carregar, tenta estabelecer a sessão a partir do link de recuperação.
  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setValidLink(!!session);
      setReady(true);
    }

    init();
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (v && v.length) fe[k] = v[0];
      }
      setFieldErrors(fe);
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updErr } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    setSaving(false);

    if (updErr) {
      setError("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/inicio"), 1500);
  }

  if (!ready) {
    return <p className="text-sm text-muted">Carregando...</p>;
  }

  if (done) {
    return (
      <div className="space-y-4">
        <Alert tone="success">Senha redefinida com sucesso! Entrando...</Alert>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-foreground">Link inválido</h1>
        <Alert tone="error">
          Este link de redefinição expirou ou é inválido.
        </Alert>
        <Link
          href="/esqueci-senha"
          className="block text-center text-sm font-medium text-brand hover:underline"
        >
          Solicitar um novo link
        </Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Nova senha</h1>
        <p className="mt-1 text-sm text-muted">Escolha uma nova senha.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <FormField
        label="Nova senha"
        htmlFor="password"
        error={fieldErrors.password}
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

      <FormField
        label="Confirmar senha"
        htmlFor="confirm"
        error={fieldErrors.confirm}
      >
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>

      <Button type="submit" fullWidth size="lg" disabled={saving}>
        {saving ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
