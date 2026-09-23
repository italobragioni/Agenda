"use client";

import { useActionState, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addBlockedTime, deleteBlockedTime } from "./blocked-actions";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { formatDateBR, formatTimeBR } from "@/lib/datetime";
import type { ActionState } from "@/lib/forms";
import type { BlockedTime } from "@/types/database";

function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Remover este bloqueio?"))
          start(() => deleteBlockedTime(id));
      }}
      className="text-muted hover:text-red-600 disabled:opacity-50"
      aria-label="Remover bloqueio"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function BlockedTimesManager({
  blocks,
  tz,
  today,
}: {
  blocks: BlockedTime[];
  tz: string;
  today: string;
}) {
  const [state, action] = useActionState(addBlockedTime, {} as ActionState);
  const [allDay, setAllDay] = useState(false);

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        {state.error && <Alert tone="error">{state.error}</Alert>}
        {state.success && <Alert tone="success">{state.success}</Alert>}

        <Input
          name="reason"
          placeholder="Motivo (ex.: Almoço, Folga)"
          aria-label="Motivo"
        />
        <Input name="date" type="date" min={today} defaultValue={today} required />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="h-5 w-5 rounded border-border accent-[var(--brand)]"
          />
          Dia inteiro
        </label>

        {!allDay && (
          <div className="flex items-center gap-2">
            <Input name="start" type="time" defaultValue="12:00" aria-label="Início" />
            <span className="text-muted">–</span>
            <Input name="end" type="time" defaultValue="13:00" aria-label="Fim" />
          </div>
        )}

        <SubmitButton pendingText="Adicionando...">
          Adicionar bloqueio
        </SubmitButton>
      </form>

      {blocks.length > 0 && (
        <ul className="space-y-2 border-t border-border pt-4">
          {blocks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {b.reason ?? "Bloqueio"}
                </p>
                <p className="text-xs text-muted">
                  {formatDateBR(b.start_at, tz)} · {formatTimeBR(b.start_at, tz)}{" "}
                  – {formatTimeBR(b.end_at, tz)}
                </p>
              </div>
              <DeleteButton id={b.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
