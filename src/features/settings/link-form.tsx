"use client";

import { useActionState, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { updateSlug } from "./actions";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/forms";

export function LinkForm({
  siteUrl,
  slug,
}: {
  siteUrl: string;
  slug: string;
}) {
  const [state, action] = useActionState(updateSlug, {} as ActionState);
  const fe = state.fieldErrors ?? {};
  const [copied, setCopied] = useState(false);

  const fullUrl = `${siteUrl}/agendar/${slug}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Alguns navegadores bloqueiam; ignora silenciosamente.
    }
  }

  return (
    <div className="space-y-4">
      {/* Link atual + copiar */}
      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-2 text-xs font-medium text-muted">
          Seu link de agendamento
        </p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-card px-3 py-2 text-sm text-foreground">
            {fullUrl}
          </code>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-foreground hover:bg-brand-hover"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copiar link
              </>
            )}
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" /> Abrir
          </a>
        </div>
      </div>

      {/* Editar apelido */}
      <form action={action} className="space-y-3">
        {state.error && <Alert tone="error">{state.error}</Alert>}
        {state.success && <Alert tone="success">{state.success}</Alert>}

        <FormField
          label="Apelido (parte final do link)"
          htmlFor="slug"
          error={fe.slug}
          hint="Use letras, números e hífens. Ex.: estetica-premium"
        >
          <Input id="slug" name="slug" defaultValue={slug} required />
        </FormField>

        <SubmitButton pendingText="Salvando...">Salvar apelido</SubmitButton>
      </form>
    </div>
  );
}
