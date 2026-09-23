import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { planState } from "./plan";
import type { PlanFields } from "./plan";

/** Faixa de aviso sobre teste acabando ou plano expirado. */
export function BillingBanner({ business }: { business: PlanFields }) {
  const state = planState(business);

  // Sem acesso: expirou.
  if (!state.active) {
    return (
      <Link
        href="/assinatura"
        className="flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-red-700"
      >
        <AlertCircle className="h-4 w-4" />
        Seu acesso expirou. Assine um plano para continuar →
      </Link>
    );
  }

  // Teste acabando (3 dias ou menos).
  if (state.isTrial && state.daysLeft <= 3) {
    return (
      <Link
        href="/assinatura"
        className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-600"
      >
        <AlertCircle className="h-4 w-4" />
        {state.daysLeft === 0
          ? "Seu teste termina hoje."
          : `Seu teste termina em ${state.daysLeft} ${state.daysLeft === 1 ? "dia" : "dias"}.`}{" "}
        Escolha um plano →
      </Link>
    );
  }

  return null;
}
