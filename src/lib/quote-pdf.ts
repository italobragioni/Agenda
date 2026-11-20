import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatCents } from "./money";
import { formatDateBR } from "./datetime";
import { formatPhone } from "./phone";
import type { Business, Quote } from "@/types/database";

const COLOR = {
  text: rgb(0.06, 0.09, 0.16),
  muted: rgb(0.44, 0.49, 0.55),
  line: rgb(0.86, 0.88, 0.91),
  boxBg: rgb(0.96, 0.97, 0.98),
  brand: rgb(0.15, 0.39, 0.92),
};

/** Número curto e estável do orçamento a partir do id. */
export function quoteNumber(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function safe(text: string): string {
  return text.replace(/·/g, "-").replace(/[–—]/g, "-");
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(tentative, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = tentative;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface QuotePdfInput {
  business: Business;
  quote: Quote;
  tz: string;
  logo?: { bytes: Uint8Array; format: "jpg" | "png" } | null;
}

export async function buildQuotePdf({
  business,
  quote,
  tz,
  logo,
}: QuotePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page: PDFPage = doc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 64;
  const contentWidth = width - margin * 2;
  const centerX = width / 2;
  let y = 841.89 - margin;

  const drawCentered = (
    text: string,
    size: number,
    font: PDFFont,
    color = COLOR.text,
  ) => {
    const t = safe(text);
    const w = font.widthOfTextAtSize(t, size);
    page.drawText(t, { x: centerX - w / 2, y, size, font, color });
  };

  // ---- Logo ----
  if (logo) {
    try {
      const img =
        logo.format === "png"
          ? await doc.embedPng(logo.bytes)
          : await doc.embedJpg(logo.bytes);
      const targetH = 54;
      let drawW = img.width * (targetH / img.height);
      let drawH = targetH;
      const maxW = 220;
      if (drawW > maxW) {
        drawH = targetH * (maxW / drawW);
        drawW = maxW;
      }
      y -= drawH;
      page.drawImage(img, { x: centerX - drawW / 2, y, width: drawW, height: drawH });
      y -= 18;
    } catch {
      // segue sem imagem
    }
  }

  // ---- Estabelecimento ----
  drawCentered(business.name, 17, bold);
  y -= 16;
  if (business.phone) {
    drawCentered(business.phone, 10, helv, COLOR.muted);
    y -= 13;
  }

  // ---- Faixa do título ----
  y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: COLOR.line });
  y -= 20;
  page.drawText("ORCAMENTO", { x: margin, y, size: 12, font: bold, color: COLOR.text });
  const numero = `No ${quoteNumber(quote.id)}`;
  const numeroW = helv.widthOfTextAtSize(numero, 10);
  page.drawText(numero, { x: width - margin - numeroW, y: y + 1, size: 10, font: helv, color: COLOR.muted });
  y -= 14;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: COLOR.line });
  y -= 26;

  // ---- Cliente ----
  if (quote.client_name || quote.client_phone) {
    page.drawText("CLIENTE", { x: margin, y, size: 8, font: bold, color: COLOR.muted });
    y -= 15;
    const clientLine = [
      quote.client_name ?? "",
      quote.client_phone ? formatPhone(quote.client_phone) : "",
    ]
      .filter(Boolean)
      .join(" - ");
    page.drawText(safe(clientLine), { x: margin, y, size: 12, font: helv, color: COLOR.text });
    y -= 24;
  }

  // ---- Itens ----
  page.drawText("ITENS", { x: margin, y, size: 8, font: bold, color: COLOR.muted });
  y -= 18;
  for (const it of quote.items) {
    const valor = it.cents ? formatCents(it.cents) : "";
    const valorW = helv.widthOfTextAtSize(valor, 11);
    const descMax = contentWidth - valorW - 16;
    const descLines = wrapText(it.desc || "Item", helv, 11, descMax);
    descLines.forEach((line, idx) => {
      page.drawText(safe(line), { x: margin, y, size: 11, font: helv, color: COLOR.text });
      if (idx === 0 && valor) {
        page.drawText(valor, { x: width - margin - valorW, y, size: 11, font: helv, color: COLOR.text });
      }
      y -= 16;
    });
    y -= 2;
    page.drawLine({ start: { x: margin, y: y + 6 }, end: { x: width - margin, y: y + 6 }, thickness: 0.5, color: COLOR.line });
  }
  y -= 10;

  // ---- Total ----
  const boxH = 54;
  page.drawRectangle({ x: margin, y: y - boxH, width: contentWidth, height: boxH, color: COLOR.boxBg });
  page.drawText("TOTAL", { x: margin + 16, y: y - 33, size: 11, font: bold, color: COLOR.muted });
  const total = formatCents(quote.total_cents);
  const totalW = bold.widthOfTextAtSize(total, 20);
  page.drawText(total, { x: width - margin - 16 - totalW, y: y - 36, size: 20, font: bold, color: COLOR.text });
  y -= boxH + 24;

  // ---- Observações / validade ----
  if (quote.note) {
    page.drawText("OBSERVACOES", { x: margin, y, size: 8, font: bold, color: COLOR.muted });
    y -= 15;
    for (const line of wrapText(quote.note, helv, 10, contentWidth)) {
      page.drawText(safe(line), { x: margin, y, size: 10, font: helv, color: COLOR.text });
      y -= 14;
    }
    y -= 8;
  }
  if (quote.validity) {
    page.drawText(safe(`Validade: ${quote.validity}`), { x: margin, y, size: 10, font: helv, color: COLOR.muted });
    y -= 20;
  }

  // ---- Rodapé ----
  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: COLOR.line });
  y -= 18;
  drawCentered(`Emitido em ${formatDateBR(quote.created_at, tz)}`, 9, helv, COLOR.muted);
  y -= 13;
  drawCentered("Feito com Carvi - carvi.online", 9, helv, COLOR.muted);

  return doc.save();
}
