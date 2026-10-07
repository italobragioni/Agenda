-- =====================================================================
-- 0011_plan_empresarial.sql
-- Permite o novo plano 'empresarial' na coluna businesses.plan.
-- =====================================================================

alter table public.businesses
  drop constraint if exists businesses_plan_check;

alter table public.businesses
  add constraint businesses_plan_check
  check (plan in ('trial', 'basic', 'premium', 'empresarial'));
