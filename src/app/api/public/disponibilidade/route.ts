import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailableSlots } from "@/features/availability/service";

/**
 * Horários disponíveis para a página pública (sem login).
 * GET /api/public/disponibilidade?slug=...&serviceId=...&date=YYYY-MM-DD
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!slug || !serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "parâmetros inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!business) {
    return NextResponse.json({ error: "não encontrado" }, { status: 404 });
  }

  const slots = await getAvailableSlots({
    businessId: business.id as string,
    serviceId,
    dayStr: date,
  });

  return NextResponse.json({ slots });
}
