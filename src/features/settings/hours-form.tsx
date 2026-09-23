"use client";

import { useActionState, useState } from "react";
import { updateHours } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { WEEKDAY_LABELS } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/forms";
import type { BusinessHours } from "@/types/database";

// Ordem de exibição: segunda a domingo.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function HoursForm({ hours }: { hours: BusinessHours[] }) {
  const [state, action] = useActionState(updateHours, {} as ActionState);

  const byWeekday = new Map(hours.map((h) => [h.weekday, h]));
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (let d = 0; d <= 6; d++) init[d] = byWeekday.get(d)?.is_open ?? false;
    return init;
  });

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <div className="space-y-2">
        {ORDER.map((d) => {
          const h = byWeekday.get(d);
          const isOpen = open[d];
          return (
            <div
              key={d}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <label className="flex w-28 shrink-0 items-center gap-2">
                <input
                  type="checkbox"
                  name={`open_${d}`}
                  checked={isOpen}
                  onChange={(e) =>
                    setOpen((o) => ({ ...o, [d]: e.target.checked }))
                  }
                  className="h-5 w-5 rounded border-border accent-[var(--brand)]"
                />
                <span className="text-sm font-medium text-foreground">
                  {WEEKDAY_LABELS[d]}
                </span>
              </label>

              <div
                className={cn(
                  "flex flex-1 items-center gap-2",
                  !isOpen && "opacity-40",
                )}
              >
                <input
                  type="time"
                  name={`start_${d}`}
                  defaultValue={h?.start_time?.slice(0, 5) ?? "08:00"}
                  disabled={!isOpen}
                  className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
                />
                <span className="text-muted">–</span>
                <input
                  type="time"
                  name={`end_${d}`}
                  defaultValue={h?.end_time?.slice(0, 5) ?? "18:00"}
                  disabled={!isOpen}
                  className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
                />
              </div>
            </div>
          );
        })}
      </div>

      <SubmitButton pendingText="Salvando...">Salvar horários</SubmitButton>
    </form>
  );
}
