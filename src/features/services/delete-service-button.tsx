"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteService } from "./actions";

export function DeleteServiceButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      `Excluir o serviço "${name}"? Os agendamentos antigos continuam no histórico.`,
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteService(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Excluir ${name}`}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
