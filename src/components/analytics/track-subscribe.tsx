"use client";

import { useEffect } from "react";
import { trackMeta } from "./meta-pixel";

/**
 * Dispara o evento "Subscribe" (assinatura) do Meta Pixel uma única vez por
 * período de assinatura. Usa uma marca no navegador para não recontar quando
 * a pessoa revisita a tela de status já ativa.
 */
export function TrackSubscribe({
  valueCents,
  plan,
}: {
  valueCents: number;
  plan: string;
}) {
  useEffect(() => {
    const key = "carvi_sub_tracked";
    try {
      if (localStorage.getItem(key) === plan) return;
      localStorage.setItem(key, plan);
    } catch {
      // Sem localStorage (aba privada): segue e dispara mesmo assim.
    }
    trackMeta("Subscribe", {
      currency: "BRL",
      value: valueCents / 100,
      content_name: plan,
    });
  }, [valueCents, plan]);

  return null;
}
