import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { planState } from "./plan";
import type { PlanFields } from "./plan";
import { InactiveBillingRefresh } from "./inactive-billing-refresh";

/** Faixa de aviso sobre teste acabando ou plano expirado. */
export function BillingBanner({ business }: { business: PlanFields }) {
  const state = planState(business);

  // Sem assinatura ativa: convida a escolher um plano.
  if (!state.active) {
    return (
      <>
        {/* Corrige a faixa quando o estado está defasado pelo cache (pós-pagamento). */}
        <InactiveBillingRefresh />
        <Link
          href="/assinatura"
          className="flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-700"
        >
          <AlertCircle className="h-4 w-4" />
          Sua conta está sem assinatura ativa. Escolha um plano para liberar →
        </Link>
      </>
    );
  }

  return null;
}
