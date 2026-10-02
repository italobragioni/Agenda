"use client";

import { useEffect } from "react";
import { trackMeta } from "./meta-pixel";

/**
 * Dispara o evento "Subscribe" (assinatura) do Meta Pixel uma única vez,
 * quando a pessoa volta do checkout do Stripe com sucesso. Depois limpa os
 * parâmetros da URL para não disparar de novo em um F5.
 */
export function TrackSubscribe({
  valueCents,
  plan,
}: {
  valueCents: number;
  plan: string;
}) {
  useEffect(() => {
    trackMeta("Subscribe", {
      currency: "BRL",
      value: valueCents / 100,
      content_name: plan,
    });
    const url = new URL(window.location.href);
    url.searchParams.delete("sucesso");
    url.searchParams.delete("plano");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [valueCents, plan]);

  return null;
}
