"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { removeMember } from "./actions";

export function MemberRemoveButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Remover o acesso de ${name}?`))
          start(() => removeMember(userId));
      }}
      aria-label={`Remover ${name}`}
      className="tap inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
