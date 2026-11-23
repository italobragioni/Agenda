import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAppointmentPhotos } from "@/features/appointments/photo-actions";
import { buildPhotosPdf } from "@/lib/photos-pdf";
import { formatDateBR } from "@/lib/datetime";

export const runtime = "nodejs";

const BUCKET = "atendimentos";
const MAX_IMAGES = 40;

function detectFormat(bytes: Uint8Array): "jpg" | "png" | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
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

/** GET /f/[id]/pdf — PDF público com as fotos do atendimento. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: appt } = await admin
    .from("appointments")
    .select("id, business_id, customer_name_snapshot, service_name_snapshot, start_at")
    .eq("id", id)
    .maybeSingle();
  if (!appt) return new Response("Atendimento não encontrado", { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("name, phone, logo_url, timezone")
    .eq("id", appt.business_id as string)
    .maybeSingle();
  if (!business) return new Response("Atendimento não encontrado", { status: 404 });

  const tz = (business.timezone as string) ?? "America/Sao_Paulo";
  const photos = await listAppointmentPhotos(appt.business_id as string, id);

  // Baixa cada foto e converte para JPEG (orienta e reduz para caber no PDF).
  const base = `${appt.business_id as string}/${id}`;
  let budget = MAX_IMAGES;
  async function toJpegs(list: { path: string }[]): Promise<Uint8Array[]> {
    const out: Uint8Array[] = [];
    for (const p of list) {
      if (budget <= 0) break;
      const dl = await admin.storage.from(BUCKET).download(`${base}/${p.path}`);
      if (!dl.data) continue;
      const raw = new Uint8Array(await dl.data.arrayBuffer());
      try {
        const jpeg = await sharp(Buffer.from(raw))
          .rotate()
          .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 72 })
          .toBuffer();
        out.push(new Uint8Array(jpeg));
        budget -= 1;
      } catch {
        // Formato não suportado (ex.: HEIC sem suporte): ignora essa foto.
      }
    }
    return out;
  }

  const groups = [
    { title: "Antes do serviço", images: await toJpegs(photos.antes) },
    { title: "Depois do serviço", images: await toJpegs(photos.depois) },
    { title: "Fotos", images: await toJpegs(photos.outras) },
  ].filter((g) => g.images.length > 0);

  if (groups.length === 0) {
    return new Response("Sem fotos para gerar o PDF", { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const logo =
    (business.logo_url ? await tryFetchImage(business.logo_url as string) : null) ??
    (await tryFetchImage(`${origin}/logo.jpg`));

  const pdf = await buildPhotosPdf({
    businessName: business.name as string,
    businessPhone: business.phone as string | null,
    customerName: appt.customer_name_snapshot as string,
    serviceName: appt.service_name_snapshot as string,
    dateStr: formatDateBR(appt.start_at as string, tz),
    groups,
    logo,
  });

  const asDownload = new URL(request.url).searchParams.get("download") === "1";
  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${asDownload ? "attachment" : "inline"}; filename="fotos-atendimento.pdf"`,
      "Cache-Control": "private, max-age=600",
    },
  });
}
