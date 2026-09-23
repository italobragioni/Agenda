"use client";

import { useTransition } from "react";
import { setServiceActive } from "./actions";
import { cn } from "@/lib/utils";

export function ActiveToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={isActive ? "Desativar serviço" : "Ativar serviço"}
      disabled={pending}
      onClick={() => startTransition(() => setServiceActive(id, !isActive))}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        isActive ? "bg-brand" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          isActive ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
