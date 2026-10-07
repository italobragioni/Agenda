-- =====================================================================
-- 0013_cakto.sql
-- Integração de pagamentos com a Cakto (substitui a Stripe).
-- Mantém as colunas da Stripe por compatibilidade (removidas depois).
-- =====================================================================

-- Dados da assinatura Cakto no estabelecimento.
alter table public.businesses
  add column if not exists cakto_subscription_id text,
  add column if not exists cakto_customer_id      text,
  -- Rótulo interno do estado da assinatura: active, late, canceled,
  -- paused, refunded, chargeback, payment_failed. O acesso em si continua
  -- vindo de paid_until (fonte da verdade).
  add column if not exists subscription_status    text;

-- Associação verificável entre o checkout e a conta (token de callback).
create table if not exists public.cakto_checkouts (
  token        text primary key,
  business_id  uuid not null references public.businesses(id) on delete cascade,
  plan         text not null check (plan in ('basic', 'premium', 'empresarial')),
  created_at   timestamptz not null default now()
);
create index if not exists idx_cakto_checkouts_business
  on public.cakto_checkouts(business_id);

-- Idempotência do webhook (dedup por evento + id do pedido).
create table if not exists public.cakto_webhook_events (
  id          text primary key, -- "<event>:<data.id>"
  event       text not null,
  received_at timestamptz not null default now()
);

-- Pagamentos sem associação confiável ficam aqui para conciliação manual,
-- em vez de liberar a conta errada.
create table if not exists public.cakto_unreconciled (
  id          uuid primary key default gen_random_uuid(),
  event       text not null,
  order_id    text,
  callback    text,
  offer_id    text,
  reason      text,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- Essas tabelas são acessadas apenas pelo servidor (service role, que ignora
-- RLS). Ativamos RLS sem policies para bloquear acesso anônimo/autenticado.
alter table public.cakto_checkouts       enable row level security;
alter table public.cakto_webhook_events  enable row level security;
alter table public.cakto_unreconciled    enable row level security;
