/**
 * Utilitários de telefone (Brasil).
 *
 * Armazenamos o número normalizado com DDI 55 e apenas dígitos, ex.:
 *   5531999999999
 * Exibimos de forma amigável, ex.:
 *   (31) 99999-9999
 */

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/**
 * Normaliza um telefone brasileiro para o formato de armazenamento
 * (55 + DDD + número). Retorna null se não parecer um número válido.
 */
export function normalizePhone(value: string): string | null {
  let digits = onlyDigits(value);

  // Remove zeros à esquerda de discagem (ex.: 0 operadora).
  digits = digits.replace(/^0+/, "");

  // Se já vier com DDI 55 (12 ou 13 dígitos), mantém.
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Sem DDI: espera 10 (fixo) ou 11 (celular) dígitos → prefixa 55.
  if (digits.length === 10 || digits.length === 11) {
    return "55" + digits;
  }

  return null;
}

/** Formata para exibição amigável: (DD) 99999-9999 ou (DD) 9999-9999. */
export function formatPhone(stored: string): string {
  const digits = onlyDigits(stored);
  const national = digits.startsWith("55") ? digits.slice(2) : digits;

  if (national.length === 11) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 7)}-${national.slice(7)}`;
  }
  if (national.length === 10) {
    return `(${national.slice(0, 2)}) ${national.slice(2, 6)}-${national.slice(6)}`;
  }
  return stored;
}

/** Monta um link wa.me para conversar no WhatsApp. */
export function whatsappLink(stored: string, message?: string): string {
  const digits = onlyDigits(stored);
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
