import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatCents } from "./money";
import { formatDateTimeBR, formatDateBR } from "./datetime";
import type { Appointment, Business } from "@/types/database";

// Paleta (aproxima o visual do app).
const COLOR = {
  text: rgb(0.06, 0.09, 0.16),
  muted: rgb(0.44, 0.49, 0.55),
  line: rgb(0.86, 0.88, 0.91),
  boxBg: rgb(0.96, 0.97, 0.98),
  green: rgb(0.13, 0.55, 0.33),
};

/** Número curto e estável do recibo a partir do id do agendamento. */
export function receiptNumber(appointmentId: string): string {
  return appointmentId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

/** Quebra o texto em linhas que cabem em `maxWidth` (na fonte/tamanho dados). */
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

/** WinAnsi (fonte padrão do PDF) não cobre alguns caracteres; troca por equivalentes. */
function safe(text: string): string {
  return text.replace(/·/g, "-").replace(/[–—]/g, "-");
}

export interface ReceiptPdfInput {
  business: Business;
  appointment: Appointment;
  tz: string;
  issuedAtIso: string;
  /** Bytes da logo (opcional) e o formato, para embutir no topo. */
  logo?: { bytes: Uint8Array; format: "jpg" | "png" } | null;
}

/** Gera o PDF do recibo e devolve os bytes. */
export async function buildReceiptPdf({
  business,
  appointment: a,
  tz,
  issuedAtIso,
  logo,
}: ReceiptPdfInput): Promise<Uint8Array> {
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

  // ---- Logo (centralizada) ----
  if (logo) {
    try {
      const img =
        logo.format === "png"
          ? await doc.embedPng(logo.bytes)
          : await doc.embedJpg(logo.bytes);
      const targetH = 54;
      const scale = targetH / img.height;
      let drawW = img.width * scale;
      const maxW = 220;
      let drawH = targetH;
      if (drawW > maxW) {
        const s = maxW / drawW;
        drawW = maxW;
        drawH = targetH * s;
      }
      y -= drawH;
      page.drawImage(img, { x: centerX - drawW / 2, y, width: drawW, height: drawH });
      y -= 18;
    } catch {
      // Logo inválida/não suportada: segue sem imagem.
    }
  }

  // ---- Nome e contato do estabelecimento ----
  drawCentered(business.name, 17, bold);
  y -= 16;
  if (business.phone) {
    drawCentered(business.phone, 10, helv, COLOR.muted);
    y -= 13;
  }
  if (business.address) {
    for (const line of wrapText(business.address, helv, 9, contentWidth)) {
      drawCentered(line, 9, helv, COLOR.muted);
      y -= 12;
    }
  }

  // ---- Faixa do título ----
  y -= 14;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: COLOR.line,
  });
  y -= 20;
  page.drawText("RECIBO", { x: margin, y, size: 12, font: bold, color: COLOR.text });
  const numero = `No ${receiptNumber(a.id)}`;
  const numeroW = helv.widthOfTextAtSize(numero, 10);
  page.drawText(numero, {
    x: width - margin - numeroW,
    y: y + 1,
    size: 10,
    font: helv,
    color: COLOR.muted,
  });
  y -= 14;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: COLOR.line,
  });
  y -= 30;

  // ---- Campos ----
  const fields: { label: string; value: string }[] = [
    { label: "CLIENTE", value: a.customer_name_snapshot },
    { label: "SERVICO", value: a.service_name_snapshot },
  ];
  if (a.notes) fields.push({ label: "OBSERVACOES", value: a.notes });
  fields.push({ label: "DATA DO SERVICO", value: formatDateTimeBR(a.start_at, tz) });

  for (const f of fields) {
    page.drawText(f.label, { x: margin, y, size: 8, font: bold, color: COLOR.muted });
    y -= 15;
    for (const line of wrapText(f.value, helv, 12, contentWidth)) {
      page.drawText(safe(line), { x: margin, y, size: 12, font: helv, color: COLOR.text });
      y -= 16;
    }
    y -= 8;
  }

  // ---- Caixa do valor ----
  y -= 6;
  const boxH = 66;
  page.drawRectangle({
    x: margin,
    y: y - boxH,
    width: contentWidth,
    height: boxH,
    color: COLOR.boxBg,
  });
  const boxTextY = y - 24;
  const label = "VALOR PAGO";
  const labelW = bold.widthOfTextAtSize(label, 9);
  page.drawText(label, {
    x: centerX - labelW / 2,
    y: boxTextY,
    size: 9,
    font: bold,
    color: COLOR.muted,
  });
  const valor = formatCents(a.price_cents);
  const valorW = bold.widthOfTextAtSize(valor, 26);
  page.drawText(valor, {
    x: centerX - valorW / 2,
    y: boxTextY - 30,
    size: 26,
    font: bold,
    color: COLOR.text,
  });
  y -= boxH + 26;

  // ---- Confirmação ----
  drawCentered("Pagamento recebido", 12, bold, COLOR.green);
  y -= 40;

  // ---- Rodapé ----
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: COLOR.line,
  });
  y -= 18;
  drawCentered(`Emitido em ${formatDateBR(issuedAtIso, tz)}`, 9, helv, COLOR.muted);
  y -= 13;
  drawCentered("Feito com Carvi - carvi.online", 9, helv, COLOR.muted);

  return doc.save();
}
