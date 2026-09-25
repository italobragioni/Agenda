-- =====================================================================
-- 0007_address.sql
-- Endereço do estabelecimento, exibido (com mapa) na página pública.
-- =====================================================================

alter table public.businesses
  add column if not exists address text;
