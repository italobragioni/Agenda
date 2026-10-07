"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Enquanto o pagamento não é confirmado, reconsulta o status no servidor a
 * cada poucos segundos (a confirmação chega pelo webhook da Cakto). Se o
 * cliente fechar a página, a confirmação continua pelo webhook.
 */
export function StatusAutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
