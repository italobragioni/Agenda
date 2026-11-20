-- 0026: orçamentos (o dono monta itens livres e envia pelo WhatsApp)
create table if not exists public.quotes (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  client_name  text,
  client_phone text,
  items        jsonb not null default '[]'::jsonb,
  note         text,
  validity     text,
  total_cents  integer not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists idx_quotes_business
  on public.quotes(business_id, created_at desc);
alter table public.quotes enable row level security;
drop policy if exists quotes_all_own on public.quotes;
create policy quotes_all_own on public.quotes
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());
