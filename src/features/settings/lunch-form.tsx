"use client";

import { useActionState, useState } from "react";
import { updateLunch } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/forms";

export function LunchForm({
  lunchStart,
  lunchEnd,
}: {
  lunchStart: string | null;
  lunchEnd: string | null;
}) {
  const [state, action] = useActionState(updateLunch, {} as ActionState);
  const [has, setHas] = useState(Boolean(lunchStart && lunchEnd));

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <p className="text-sm text-muted">
        Bloqueia esse intervalo todos os dias em que você atende. Ninguém
        consegue agendar no seu almoço — nem você, nem pela página pública.
      </p>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="has_lunch"
          checked={has}
          onChange={(e) => setHas(e.target.checked)}
          className="h-5 w-5 rounded border-border accent-[var(--brand)]"
        />
        <span className="text-sm font-medium text-foreground">
          Tenho horário de almoço
        </span>
      </label>

      <div
        className={cn(
          "flex items-center gap-2",
          !has && "pointer-events-none opacity-40",
        )}
      >
        <input
          type="time"
          name="lunch_start"
          defaultValue={lunchStart?.slice(0, 5) ?? "12:00"}
          disabled={!has}
          aria-label="Início do almoço"
          className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
        />
        <span className="text-muted">–</span>
        <input
          type="time"
          name="lunch_end"
          defaultValue={lunchEnd?.slice(0, 5) ?? "13:00"}
          disabled={!has}
          aria-label="Fim do almoço"
          className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
        />
      </div>

      <SubmitButton pendingText="Salvando...">Salvar almoço</SubmitButton>
    </form>
  );
}
