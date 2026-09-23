"use client";

import { useTransition } from "react";
import { Play, Check, X, Loader2 } from "lucide-react";
import { setAppointmentStatus } from "./actions";
import type { AppointmentStatus } from "@/types/database";
import { cn } from "@/lib/utils";

export function AppointmentActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const [pending, startTransition] = useTransition();

  function change(next: AppointmentStatus, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(() => setAppointmentStatus(id, next));
  }

  if (status === "completed" || status === "cancelled" || status === "no_show") {
    return null;
  }

  const btn =
    "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-1.5">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted" />}

      {status === "scheduled" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("in_progress")}
          className={cn(btn, "bg-amber-50 text-amber-700 hover:bg-amber-100")}
        >
          <Play className="h-3.5 w-3.5" /> Iniciar
        </button>
      )}

      {status === "in_progress" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("completed")}
          className={cn(btn, "bg-green-50 text-green-700 hover:bg-green-100")}
        >
          <Check className="h-3.5 w-3.5" /> Finalizar
        </button>
      )}

      {status === "scheduled" && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            change("no_show", "Marcar que o cliente não compareceu?")
          }
          className={cn(btn, "bg-slate-100 text-slate-600 hover:bg-slate-200")}
        >
          Não veio
        </button>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={() => change("cancelled", "Cancelar este agendamento?")}
        className={cn(btn, "bg-red-50 text-red-600 hover:bg-red-100")}
      >
        <X className="h-3.5 w-3.5" /> Cancelar
      </button>
    </div>
  );
}
