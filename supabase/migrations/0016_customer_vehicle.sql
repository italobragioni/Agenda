-- =====================================================================
-- 0016_customer_vehicle.sql
-- Campo opcional "carro" do cliente (texto livre, ex.: "Gol prata").
-- Seguro e idempotente. Enquanto não for aplicada, o cadastro de cliente
-- continua funcionando (nome + telefone); o carro passa a ser salvo depois.
-- =====================================================================

alter table public.customers
  add column if not exists vehicle text;
