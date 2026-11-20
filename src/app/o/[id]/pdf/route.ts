import { buildQuotePdf, quoteNumber } from "@/lib/quote-pdf";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Quote, Business } from "@/types/database";

export const runtime = "nodejs";

function detectFormat(bytes: Uint8Array): "jpg" | "png" | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "png";
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
    return format ? { bytes, format } : null;
  } catch {
    return null;
  }
}

/**
 * GET /o/[id]/pdf — PDF público do orçamento (link compartilhável).
 * O id é um UUID não adivinhável, igual ao link do recibo.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: quoteData } = await admin
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!quoteData) return new Response("Orçamento não encontrado", { status: 404 });
  const quote = quoteData as Quote;

  const { data: bizData } = await admin
    .from("businesses")
    .select("*")
    .eq("id", quote.business_id)
    .maybeSingle();
  if (!bizData) return new Response("Orçamento não encontrado", { status: 404 });
  const business = bizData as Business;

  const origin = new URL(request.url).origin;
  const logo =
    (business.logo_url ? await tryFetchImage(business.logo_url) : null) ??
    (await tryFetchImage(`${origin}/logo.jpg`));

  const pdf = await buildQuotePdf({
    business,
    quote,
    tz: business.timezone,
    logo,
  });

  const fileName = `orcamento-${quoteNumber(quote.id)}.pdf`;
  const asDownload = new URL(request.url).searchParams.get("download") === "1";

  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${asDownload ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
