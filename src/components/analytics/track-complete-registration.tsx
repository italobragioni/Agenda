"use client";

import { useEffect } from "react";
import { trackMeta } from "./meta-pixel";

/**
 * Dispara o evento "Concluir inscrição" (CompleteRegistration) do Meta Pixel
 * uma única vez, logo após o cadastro. É renderizado só quando a pessoa chega
 * no onboarding recém-criada (com ?novo=1 na URL); depois limpa o parâmetro
 * para não disparar de novo em um F5.
 */
export function TrackCompleteRegistration() {
  useEffect(() => {
    trackMeta("CompleteRegistration");
    // Remove o ?novo=1 da URL sem recarregar a página.
    const url = new URL(window.location.href);
    url.searchParams.delete("novo");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, []);

  return null;
}
