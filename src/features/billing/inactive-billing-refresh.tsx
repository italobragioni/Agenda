"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Renderizado só quando a conta aparece "sem assinatura". Força o app a buscar
 * o estado real no servidor (ao abrir e ao voltar para a aba), corrigindo a
 * faixa quando ela está defasada pelo cache após o pagamento. Se a conta já
 * estiver ativa, o servidor deixa de renderizar este componente.
 */
export function InactiveBillingRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Ao montar: confere o estado atual (corrige a faixa logo após pagar).
    router.refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [router]);

  return null;
}
