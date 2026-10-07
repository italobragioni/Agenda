-- =====================================================================
-- 0010_service_vehicle_prices.sql
-- Preço por porte de veículo (opcional) em cada serviço. Quando nulo,
-- o agendamento usa o preço base do serviço (price_cents).
-- =====================================================================

alter table public.services
  add column if not exists price_hatch_cents       integer
    check (price_hatch_cents is null or price_hatch_cents >= 0),
  add column if not exists price_sedan_cents       integer
    check (price_sedan_cents is null or price_sedan_cents >= 0),
  add column if not exists price_suv_cents         integer
    check (price_suv_cents is null or price_suv_cents >= 0),
  add column if not exists price_caminhonete_cents integer
    check (price_caminhonete_cents is null or price_caminhonete_cents >= 0);
