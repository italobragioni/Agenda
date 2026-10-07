/** Tipos de veículo oferecidos no agendamento público. */
export const VEHICLE_TYPES = ["Hatch", "Sedan", "SUV", "Caminhonete"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export function isVehicleType(v: string): v is VehicleType {
  return (VEHICLE_TYPES as readonly string[]).includes(v);
}

/** Campos de preço por porte que um serviço pode ter. */
export interface VehiclePricing {
  price_cents: number;
  price_hatch_cents?: number | null;
  price_sedan_cents?: number | null;
  price_suv_cents?: number | null;
  price_caminhonete_cents?: number | null;
}

/**
 * Preço do serviço para um veículo. Usa o preço específico do porte quando
 * definido; caso contrário, cai no preço base do serviço.
 */
export function vehiclePriceCents(
  service: VehiclePricing,
  vehicle?: string | null,
): number {
  const map: Record<VehicleType, number | null | undefined> = {
    Hatch: service.price_hatch_cents,
    Sedan: service.price_sedan_cents,
    SUV: service.price_suv_cents,
    Caminhonete: service.price_caminhonete_cents,
  };
  const v = vehicle && isVehicleType(vehicle) ? map[vehicle] : undefined;
  return typeof v === "number" ? v : service.price_cents;
}

/** Menor preço entre base e portes definidos (para "a partir de"). */
export function fromPriceCents(service: VehiclePricing): number {
  const prices = [
    service.price_cents,
    service.price_hatch_cents,
    service.price_sedan_cents,
    service.price_suv_cents,
    service.price_caminhonete_cents,
  ].filter((p): p is number => typeof p === "number");
  return prices.length ? Math.min(...prices) : service.price_cents;
}

/** Indica se o serviço tem algum preço de porte diferente do base. */
export function hasVehicleVariation(service: VehiclePricing): boolean {
  return [
    service.price_hatch_cents,
    service.price_sedan_cents,
    service.price_suv_cents,
    service.price_caminhonete_cents,
  ].some((p) => typeof p === "number" && p !== service.price_cents);
}
