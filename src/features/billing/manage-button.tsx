"use client";

import { useTransition } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { createPortalSession } from "./actions";

export function ManageSubscriptionButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await createPortalSession();
          if (res.url) window.location.href = res.url;
        })
      }
      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      Gerenciar assinatura
    </button>
  );
}
