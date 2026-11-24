-- Ativação automática por e-mail (vendas por afiliado / checkout externo).
-- Pode rodar quantas vezes quiser; é seguro repetir.

-- 1) Guarda pagamentos que chegam ANTES da pessoa ter conta (pelo e-mail).
create table if not exists public.pending_activations (
  email                 text primary key,
  plan                  text not null,
  paid_until            timestamptz,
  current_period_start  timestamptz,
  cakto_customer_id     text,
  cakto_subscription_id text,
  subscription_status   text,
  business_id           uuid references public.businesses(id) on delete set null,
  consumed_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
alter table public.pending_activations enable row level security;
-- Sem políticas: só o servidor (service role) acessa.

-- 2) Função que acha o estabelecimento a partir do e-mail do comprador.
create or replace function public.find_business_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select b.id
    from auth.users u
    join public.profiles  p on p.id = u.id
    join public.businesses b on b.id = p.business_id
   where lower(u.email) = lower(p_email)
   order by b.created_at desc
   limit 1;
$$;
