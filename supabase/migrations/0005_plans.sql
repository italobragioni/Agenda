-- =====================================================================
-- 0005_plans.sql
-- Modelo de assinatura: teste grátis de 7 dias, depois plano Básico ou
-- Premium.
--   trial   : período de teste (acesso total até trial_ends_at)
--   basic   : R$ 9,90/mês, até 20 agendamentos por mês
--   premium : R$ 29,90/mês, agendamentos ilimitados
--
-- A validade de um plano pago é controlada por paid_until (atualizado
-- pelo webhook do Stripe). Os limites são aplicados no servidor.
-- =====================================================================

alter table public.businesses
  add column if not exists plan text not null default 'trial'
    check (plan in ('trial', 'basic', 'premium'));
alter table public.businesses
  add column if not exists trial_ends_at timestamptz;
alter table public.businesses
  add column if not exists paid_until timestamptz;
alter table public.businesses
  add column if not exists stripe_customer_id text;
alter table public.businesses
  add column if not exists stripe_subscription_id text;

-- Cortesia para contas já existentes (conta do fundador / testes):
-- Premium sem expiração, para não bloquear quem já usava o sistema.
update public.businesses
   set plan = 'premium',
       paid_until = '2099-12-31T00:00:00Z'
 where trial_ends_at is null
   and paid_until is null;
