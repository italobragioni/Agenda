"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession } from "./actions";
import { PLANS } from "./plan";
import { formatCents } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function PlanCards({ currentPlan }: { currentPlan: string }) {
  const [pending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  function subscribe(plan: "basic" | "premium") {
    setError(undefined);
    setLoadingPlan(plan);
    startTransition(async () => {
      const res = await createCheckoutSession(plan);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setError(res.error ?? "Não foi possível iniciar o pagamento.");
        setLoadingPlan(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2">
        {(["basic", "premium"] as const).map((key) => {
          const plan = PLANS[key];
          const isCurrent = currentPlan === key;
          const highlight = key === "premium";
          return (
            <Card
              key={key}
              className={cn(highlight && "border-brand ring-1 ring-brand")}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  {plan.name}
                </h3>
                {highlight && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                    Mais popular
                  </span>
                )}
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCents(plan.priceCents)}
                <span className="text-sm font-normal text-muted">/mês</span>
              </p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={pending || isCurrent}
                onClick={() => subscribe(key)}
                className={cn(
                  "mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60",
                  highlight
                    ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                    : "border border-border bg-card text-foreground hover:bg-slate-50",
                )}
              >
                {loadingPlan === key && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isCurrent ? "Plano atual" : `Assinar ${plan.name}`}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
