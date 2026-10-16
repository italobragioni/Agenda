import { formatCents } from "./money";
import { formatDateTimeBR } from "./datetime";

/**
 * Monta o texto do recibo que o estabelecimento envia ao cliente (WhatsApp).
 */
export function receiptMessage(opts: {
  businessName: string;
  customerName?: string | null;
  serviceName: string;
  notes?: string | null; // ex.: "Veículo: Hatch"
  startAtIso: string;
  tz: string;
  priceCents: number;
}): string {
  const {
    businessName,
    customerName,
    serviceName,
    notes,
    startAtIso,
    tz,
    priceCents,
  } = opts;

  const lines = [
    `🧾 *Recibo — ${businessName}*`,
    "",
    customerName ? `Cliente: ${customerName}` : null,
    `Serviço: ${serviceName}`,
    notes ? notes : null,
    `Data: ${formatDateTimeBR(startAtIso, tz)}`,
    `Valor: ${formatCents(priceCents)}`,
    "",
    "Pagamento recebido. Obrigado pela preferência! 🚗✨",
  ].filter(Boolean);

  return lines.join("\n");
}
