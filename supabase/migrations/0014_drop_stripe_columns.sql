-- =====================================================================
-- 0014_drop_stripe_columns.sql  (OPCIONAL — limpeza)
-- Remove as colunas exclusivas da Stripe de businesses. Não há dados de
-- pagamento da Stripe (nenhum cliente pagante usou a Stripe), então é seguro.
-- Rode só se quiser deixar o banco limpo; não é obrigatório.
-- =====================================================================

alter table public.businesses
  drop column if exists stripe_customer_id,
  drop column if exists stripe_subscription_id;
