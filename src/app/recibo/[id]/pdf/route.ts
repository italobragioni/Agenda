import { createClient } from "@/lib/supabase/server";
import { getCurrentContext } from "@/features/auth/current";
import { buildReceiptPdf, receiptNumber } from "@/lib/receipt-pdf";
import type { Appointment } from "@/types/database";

export const runtime = "nodejs";

/** Detecta o formato da imagem pelos bytes iniciais (jpg ou png). */
function detectFormat(bytes: Uint8Array): "jpg" | "png" | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  return null;
}

async function tryFetchImage(
  url: string,
): Promise<{ bytes: Uint8Array; format: "jpg" | "png" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const format = detectFormat(bytes);
    if (!format) return null;
    return { bytes, format };
  } catch {
    return null;
  }
}

/** GET /recibo/[id]/pdf — devolve o recibo do agendamento em PDF. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ctx = await getCurrentContext();
  if (!ctx) {
    return new Response("Não autorizado", { status: 401 });
  }

  const supabase = await createClient();
  // RLS garante que só retorna agendamento do próprio estabelecimento.
  const { data } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return new Response("Recibo não encontrado", { status: 404 });
  }
  const appointment = data as Appointment;

  // Logo: a do estabelecimento (se enviada) ou a da Carvi como padrão.
  const origin = new URL(request.url).origin;
  const logo =
    (ctx.business.logo_url
      ? await tryFetchImage(ctx.business.logo_url)
      : null) ?? (await tryFetchImage(`${origin}/logo.jpg`));

  const pdf = await buildReceiptPdf({
    business: ctx.business,
    appointment,
    tz: ctx.business.timezone,
    issuedAtIso: new Date().toISOString(),
    logo,
  });

  const fileName = `recibo-${receiptNumber(appointment.id)}.pdf`;
  // ?download=1 força o download; sem o parâmetro, abre na tela (inline),
  // o que permite usar o compartilhamento nativo do iPhone.
  const asDownload = new URL(request.url).searchParams.get("download") === "1";

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${asDownload ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
