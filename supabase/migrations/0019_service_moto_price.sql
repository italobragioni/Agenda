-- =====================================================================
-- 0019_service_moto_price.sql
-- Adiciona os portes "Moto Pequena" e "Moto Grande" aos preços opcionais
-- por veículo dos serviços. Quando nulo, o agendamento usa o preço base
-- do serviço (price_cents).
-- =====================================================================

alter table public.services
  add column if not exists price_moto_pequena_cents integer
    check (price_moto_pequena_cents is null or price_moto_pequena_cents >= 0),
  add column if not exists price_moto_grande_cents  integer
    check (price_moto_grande_cents is null or price_moto_grande_cents >= 0);
