-- =====================================================================
-- 0009_finance_entries.sql
-- Lançamentos financeiros manuais: despesas (saídas) e outras entradas
-- (ex.: venda de produto, gorjeta). O faturamento dos agendamentos
-- continua vindo da tabela appointments (status completed).
-- =====================================================================

create table if not exists public.finance_entries (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  type         text not null check (type in ('income', 'expense')),
  description  text,
  category     text,
  amount_cents integer not null check (amount_cents >= 0),
  occurred_on  date not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_finance_entries_business_date
  on public.finance_entries(business_id, occurred_on);

alter table public.finance_entries enable row level security;

drop policy if exists finance_entries_all_own on public.finance_entries;
create policy finance_entries_all_own on public.finance_entries
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());
