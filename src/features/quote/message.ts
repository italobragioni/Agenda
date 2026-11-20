import { formatCents } from "@/lib/money";
import type { QuoteItem } from "@/types/database";

/** Monta a mensagem de orçamento pronta para enviar no WhatsApp. */
export function buildQuoteMessage(opts: {
  businessName: string;
  clientName?: string | null;
  items: QuoteItem[];
  note?: string | null;
  validity?: string | null;
  totalCents: number;
  /** Link público do PDF (quando o orçamento foi salvo). */
  pdfUrl?: string | null;
}): string {
  const { businessName, clientName, items, note, validity, totalCents, pdfUrl } =
    opts;
  const lines: string[] = [];
  lines.push(`*Orçamento — ${businessName}*`);
  lines.push("");
  lines.push(
    clientName && clientName.trim()
      ? `Olá, ${clientName.trim()}! Segue seu orçamento:`
      : "Segue seu orçamento:",
  );
  lines.push("");
  for (const it of items) {
    const desc = it.desc.trim() || "Item";
    lines.push(it.cents ? `• ${desc}: ${formatCents(it.cents)}` : `• ${desc}`);
  }
  lines.push("");
  lines.push(`*Total: ${formatCents(totalCents)}*`);
  if (note && note.trim()) {
    lines.push("");
    lines.push(note.trim());
  }
  if (validity && validity.trim()) {
    lines.push("");
    lines.push(`Validade: ${validity.trim()}`);
  }
  if (pdfUrl && pdfUrl.trim()) {
    lines.push("");
    lines.push(`Orçamento em PDF: ${pdfUrl.trim()}`);
  }
  lines.push("");
  lines.push("Qualquer dúvida, estou à disposição!");
  return lines.join("\n");
}
