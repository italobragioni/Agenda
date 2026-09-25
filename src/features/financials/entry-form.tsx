"use client";

import { useActionState, useState } from "react";
import { addFinanceEntry } from "./entries-actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/forms";

export function EntryForm({ today }: { today: string }) {
  const [state, action] = useActionState(addFinanceEntry, {} as ActionState);
  const [type, setType] = useState<"expense" | "income">("expense");

  return (
    <form action={action} className="space-y-3">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <input type="hidden" name="type" value={type} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "tap h-10 rounded-xl border text-sm font-medium",
            type === "expense"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-border bg-card text-muted",
          )}
        >
          Saída (despesa)
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "tap h-10 rounded-xl border text-sm font-medium",
            type === "income"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-border bg-card text-muted",
          )}
        >
          Entrada
        </button>
      </div>

      <Input name="description" placeholder="Descrição (ex.: Aluguel, Cera)" />
      <div className="grid grid-cols-2 gap-2">
        <Input name="amount" inputMode="decimal" placeholder="Valor (R$)" required />
        <Input name="occurred_on" type="date" defaultValue={today} required />
      </div>

      <SubmitButton pendingText="Salvando...">Adicionar lançamento</SubmitButton>
    </form>
  );
}
