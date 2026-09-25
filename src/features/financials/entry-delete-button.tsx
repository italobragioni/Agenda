"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteFinanceEntry } from "./entries-actions";

export function EntryDeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Remover este lançamento?"))
          start(() => deleteFinanceEntry(id));
      }}
      className="tap text-muted hover:text-red-600 disabled:opacity-50"
      aria-label="Remover lançamento"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
