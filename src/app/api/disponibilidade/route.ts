import { NextResponse } from "next/server";
import { getCurrentContext } from "@/features/auth/current";
import { getAvailableSlots } from "@/features/availability/service";

/**
 * Retorna os horários disponíveis para um serviço em uma data.
 * Uso administrativo: exige sessão do dono; o business é o dele.
 * GET /api/disponibilidade?serviceId=...&date=YYYY-MM-DD
 */
export async function GET(request: Request) {
  const ctx = await getCurrentContext();
  if (!ctx) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "parâmetros inválidos" }, { status: 400 });
  }

  const slots = await getAvailableSlots({
    businessId: ctx.business.id,
    serviceId,
    dayStr: date,
  });

  return NextResponse.json({ slots });
}
