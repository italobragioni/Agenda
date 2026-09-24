"use client";

import { useTransition } from "react";
import { Loader2, Crown, RotateCcw } from "lucide-react";
import { grantPremium, restartTrial } from "./actions";

export function AdminRowActions({ businessId }: { businessId: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Liberar Premium de cortesia para este estabelecimento?"))
            start(() => grantPremium(businessId));
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand hover:bg-blue-100 disabled:opacity-50"
      >
        <Crown className="h-3.5 w-3.5" /> Premium
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Reiniciar o teste grátis (7 dias) deste estabelecimento?"))
            start(() => restartTrial(businessId));
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Teste
      </button>
    </div>
  );
}
