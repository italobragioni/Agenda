"use client";

import { useState, useTransition } from "react";
import { EyeOff, RotateCcw, Loader2 } from "lucide-react";
import { toggleAppointmentRevenue } from "./actions";

/**
 * Botão para tirar (ou devolver) um atendimento finalizado do faturamento.
 * O atendimento continua na agenda como histórico; só deixa de contar no
 * Financeiro. Aparece apenas em atendimentos finalizados.
 */
export function RevenueToggleButton({
  id,
  excluded,
}: {
  id: string;
  excluded: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await toggleAppointmentRevenue(id, !excluded);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="tap inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-slate-50 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : excluded ? (
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        )}
        {excluded ? "Incluir no faturamento" : "Remover do faturamento"}
      </button>
      {error && (
        <span className="w-full text-xs text-red-600">{error}</span>
      )}
    </>
  );
}
