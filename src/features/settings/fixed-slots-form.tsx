"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { updateFixedSlots } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/forms";

export function FixedSlotsForm({ times }: { times: string[] }) {
  const [state, action] = useActionState(updateFixedSlots, {} as ActionState);
  const [enabled, setEnabled] = useState(times.length > 0);
  const [rows, setRows] = useState<string[]>(
    times.length > 0 ? times.map((t) => t.slice(0, 5)) : ["08:00"],
  );

  const setRow = (i: number, v: string) =>
    setRows((r) => r.map((x, idx) => (idx === i ? v : x)));
  const addRow = () => setRows((r) => [...r, "13:00"]);
  const removeRow = (i: number) =>
    setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r));

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <p className="text-sm text-muted">
        Por padrão, o cliente pode marcar de 30 em 30 minutos. Ligue aqui para
        aceitar agendamentos <strong>apenas</strong> nos horários que você
        definir (ex.: 08:00 e 13:00). Vale no painel e na página pública.
      </p>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="fixed_enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 rounded border-border accent-[var(--brand)]"
        />
        <span className="text-sm font-medium text-foreground">
          Aceitar só em horários fixos
        </span>
      </label>

      <div className={cn("space-y-2", !enabled && "pointer-events-none opacity-40")}>
        {rows.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="time"
              name="fixed_time"
              value={t}
              disabled={!enabled}
              onChange={(e) => setRow(i, e.target.value)}
              className="h-9 w-36 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={!enabled || rows.length <= 1}
              aria-label="Remover horário"
              className="tap flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-slate-100 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          disabled={!enabled}
          className="tap inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Adicionar horário
        </button>
      </div>

      <SubmitButton pendingText="Salvando...">Salvar horários</SubmitButton>
    </form>
  );
}
