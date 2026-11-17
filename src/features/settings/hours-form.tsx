"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { updateHours } from "./actions";
import { rangesForDay, endForInput } from "./hours";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { WEEKDAY_LABELS } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/forms";
import type { BusinessHours, TimeRange } from "@/types/database";

// Ordem de exibição: segunda a domingo.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

type DayState = Record<number, TimeRange[]>;

function buildInitial(hours: BusinessHours[]): DayState {
  const byWeekday = new Map(hours.map((h) => [h.weekday, h]));
  const init: DayState = {};
  for (let d = 0; d <= 6; d++) {
    const h = byWeekday.get(d);
    // Converte fim de meia-noite ("24:00") para "00:00" que o input aceita.
    init[d] = h
      ? rangesForDay(h).map((r) => ({ start: r.start, end: endForInput(r.end) }))
      : [];
  }
  return init;
}

export function HoursForm({ hours }: { hours: BusinessHours[] }) {
  const router = useRouter();
  const [state, action] = useActionState(updateHours, {} as ActionState);

  const [days, setDays] = useState<DayState>(() => buildInitial(hours));

  // Re-sincroniza com o servidor quando os dados salvos mudam.
  const signature = useMemo(
    () =>
      hours
        .map(
          (h) =>
            `${h.weekday}:${h.is_open ? 1 : 0}:${JSON.stringify(
              h.time_ranges ?? [],
            )}:${h.start_time ?? ""}-${h.end_time ?? ""}`,
        )
        .sort()
        .join("|"),
    [hours],
  );
  useEffect(() => {
    setDays(buildInitial(hours));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // Após salvar com sucesso, busca os dados novos do servidor.
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state, router]);

  function toggleDay(d: number, checked: boolean) {
    setDays((prev) => ({
      ...prev,
      [d]: checked
        ? prev[d].length > 0
          ? prev[d]
          : [{ start: "08:00", end: "18:00" }]
        : [],
    }));
  }

  function addRange(d: number) {
    setDays((prev) => {
      const list = prev[d];
      const last = list[list.length - 1];
      const nextStart = last?.end && last.end !== "00:00" ? last.end : "08:00";
      return { ...prev, [d]: [...list, { start: nextStart, end: "18:00" }] };
    });
  }

  function removeRange(d: number, i: number) {
    setDays((prev) => ({
      ...prev,
      [d]: prev[d].filter((_, idx) => idx !== i),
    }));
  }

  function setRange(d: number, i: number, field: "start" | "end", value: string) {
    setDays((prev) => ({
      ...prev,
      [d]: prev[d].map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    }));
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      {/* Envia tudo em um único campo (JSON) para o servidor. */}
      <input type="hidden" name="hours_json" value={JSON.stringify(days)} />

      <div className="space-y-2">
        {ORDER.map((d) => {
          const ranges = days[d] ?? [];
          const isOpen = ranges.length > 0;
          return (
            <div
              key={d}
              className="rounded-xl border border-border bg-card px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => toggleDay(d, e.target.checked)}
                    className="h-5 w-5 rounded border-border accent-[var(--brand)]"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {WEEKDAY_LABELS[d]}
                  </span>
                </label>

                {isOpen ? (
                  <button
                    type="button"
                    onClick={() => addRange(d)}
                    className="tap inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-brand hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Período
                  </button>
                ) : (
                  <span className="text-xs text-muted">Fechado</span>
                )}
              </div>

              {isOpen && (
                <div className="mt-2 space-y-2">
                  {ranges.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={r.start}
                        onChange={(e) => setRange(d, i, "start", e.target.value)}
                        className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
                      />
                      <span className="text-muted">–</span>
                      <input
                        type="time"
                        value={r.end}
                        onChange={(e) => setRange(d, i, "end", e.target.value)}
                        className="h-9 flex-1 rounded-lg border border-border bg-card px-2 text-sm focus:border-brand focus:outline-2 focus:outline-brand"
                      />
                      <button
                        type="button"
                        aria-label="Remover período"
                        onClick={() => removeRange(d, i)}
                        className={cn(
                          "tap flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50",
                          ranges.length === 1 && "opacity-50",
                        )}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Dica: adicione mais de um período no mesmo dia para fechar no intervalo
        (ex.: 08:00–12:00 e 14:00–18:00).
      </p>

      <SubmitButton pendingText="Salvando...">Salvar horários</SubmitButton>
    </form>
  );
}
