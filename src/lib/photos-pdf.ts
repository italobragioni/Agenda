import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type PDFImage } from "pdf-lib";

const COLOR = {
  text: rgb(0.06, 0.09, 0.16),
  muted: rgb(0.44, 0.49, 0.55),
  line: rgb(0.86, 0.88, 0.91),
};

function safe(text: string): string {
  return text.replace(/·/g, "-").replace(/[–—]/g, "-");
}

export interface PhotosPdfInput {
  businessName: string;
  businessPhone?: string | null;
  customerName: string;
  serviceName: string;
  dateStr: string;
  /** Imagens já convertidas para JPEG, por fase. */
  groups: { title: string; images: Uint8Array[] }[];
  logo?: { bytes: Uint8Array; format: "jpg" | "png" } | null;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const GAP = 12;

export async function buildPhotosPdf(input: PhotosPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const contentW = PAGE_W - MARGIN * 2;
  const cellW = (contentW - GAP) / 2; // 2 colunas
  const cellH = cellW * 0.75; // proporção 4:3

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const centerX = PAGE_W / 2;
  const drawCentered = (text: string, size: number, font: PDFFont, color = COLOR.text) => {
    const t = safe(text);
    const w = font.widthOfTextAtSize(t, size);
    page.drawText(t, { x: centerX - w / 2, y, size, font, color });
  };

  // ---- Cabeçalho ----
  if (input.logo) {
    try {
      const img =
        input.logo.format === "png"
          ? await doc.embedPng(input.logo.bytes)
          : await doc.embedJpg(input.logo.bytes);
      const targetH = 44;
      let drawW = img.width * (targetH / img.height);
      let drawH = targetH;
      const maxW = 180;
      if (drawW > maxW) {
        drawH = targetH * (maxW / drawW);
        drawW = maxW;
      }
      y -= drawH;
      page.drawImage(img, { x: centerX - drawW / 2, y, width: drawW, height: drawH });
      y -= 14;
    } catch {
      // segue sem logo
    }
  }
  drawCentered(input.businessName, 16, bold);
  y -= 16;
  drawCentered("Fotos do atendimento", 10, helv, COLOR.muted);
  y -= 20;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: COLOR.line });
  y -= 18;
  page.drawText(safe(input.customerName), { x: MARGIN, y, size: 12, font: bold, color: COLOR.text });
  y -= 15;
  page.drawText(safe(`${input.serviceName} - ${input.dateStr}`), { x: MARGIN, y, size: 10, font: helv, color: COLOR.muted });
  y -= 22;

  // ---- Grupos (Antes / Depois / Fotos) ----
  for (const group of input.groups) {
    if (group.images.length === 0) continue;

    // Título da seção (nova página se não couber o título + 1 linha de fotos).
    if (y < MARGIN + cellH + 30) newPage();
    page.drawText(safe(group.title), { x: MARGIN, y, size: 12, font: bold, color: COLOR.text });
    y -= 18;

    let col = 0;
    let rowTop = y;
    for (const bytes of group.images) {
      let img: PDFImage;
      try {
        img = await doc.embedJpg(bytes);
      } catch {
        continue; // imagem inválida: ignora
      }

      if (col === 0) {
        // Começa nova linha: verifica espaço, senão nova página.
        if (y - cellH < MARGIN) {
          newPage();
        }
        rowTop = y;
      }

      const x = MARGIN + col * (cellW + GAP);
      // "Contain": cabe dentro da célula preservando proporção.
      const scale = Math.min(cellW / img.width, cellH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offX = x + (cellW - drawW) / 2;
      const offY = rowTop - cellH + (cellH - drawH) / 2;
      page.drawImage(img, { x: offX, y: offY, width: drawW, height: drawH });

      col += 1;
      if (col === 2) {
        col = 0;
        y = rowTop - cellH - GAP;
      }
    }
    if (col === 1) {
      // Fechou linha com uma imagem só.
      y = rowTop - cellH - GAP;
    }
    y -= 10;
  }

  // ---- Rodapé na última página ----
  const footerY = MARGIN - 6;
  const footer = "Feito com Carvi - carvi.online";
  const fw = helv.widthOfTextAtSize(footer, 9);
  page.drawText(footer, { x: centerX - fw / 2, y: footerY, size: 9, font: helv, color: COLOR.muted });

  return doc.save();
}
