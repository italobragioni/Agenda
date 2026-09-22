"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "./button";
import type { ComponentProps } from "react";

/**
 * Botão de envio para formulários com Server Actions.
 * Mostra estado de carregamento automaticamente enquanto a ação roda.
 */
export function SubmitButton({
  children,
  pendingText,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? (pendingText ?? "Aguarde...") : children}
    </Button>
  );
}
