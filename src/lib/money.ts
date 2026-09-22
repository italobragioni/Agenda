/**
 * Utilitários monetários. Valores são sempre inteiros em CENTAVOS.
 * Ex.: 8000 centavos = R$ 80,00.
 */

/** Formata centavos como moeda brasileira: 8000 -> "R$ 80,00". */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Converte um texto digitado pelo usuário (ex.: "80", "80,50", "R$ 1.234,56")
 * em centavos (inteiro). Retorna null se inválido.
 */
export function parseCurrencyToCents(input: string): number | null {
  if (input == null) return null;
  const cleaned = String(input)
    .replace(/[^\d.,-]/g, "") // remove R$, espaços etc.
    .replace(/\./g, "") // remove separador de milhar
    .replace(",", "."); // vírgula decimal -> ponto
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
