-- =====================================================================
-- 0019_service_moto_price.sql
-- Adiciona o porte "Moto" aos preços opcionais por veículo dos serviços.
-- Quando nulo, o agendamento usa o preço base do serviço (price_cents).
-- =====================================================================

alter table public.services
  add column if not exists price_moto_cents integer
    check (price_moto_cents is null or price_moto_cents >= 0);
