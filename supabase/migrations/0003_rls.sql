-- =====================================================================
-- 0003_rls.sql
-- Row Level Security (isolamento multi-tenant).
--
-- Regra geral: o dono logado só acessa dados do PRÓPRIO estabelecimento.
-- O público (cliente final sem login) NÃO tem acesso direto às tabelas;
-- a página pública é servida pelo servidor (chave service_role), que
-- entrega apenas o necessário. Por isso não há políticas para "anon".
-- =====================================================================

-- Descobre o business_id do usuário autenticado.
-- SECURITY DEFINER: lê profiles ignorando o RLS (evita recursão).
create or replace function public.auth_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.profiles where id = auth.uid();
$$;

-- Ativa RLS em todas as tabelas.
alter table public.businesses     enable row level security;
alter table public.profiles       enable row level security;
alter table public.customers      enable row level security;
alter table public.services       enable row level security;
alter table public.appointments   enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_times  enable row level security;

-- ---------------------------------------------------------------------
-- businesses: o dono lê e atualiza apenas o seu estabelecimento.
-- (A criação é feita no cadastro, via service_role no servidor.)
-- ---------------------------------------------------------------------
drop policy if exists businesses_select_own on public.businesses;
create policy businesses_select_own on public.businesses
  for select to authenticated
  using (id = public.auth_business_id());

drop policy if exists businesses_update_own on public.businesses;
create policy businesses_update_own on public.businesses
  for update to authenticated
  using (id = public.auth_business_id())
  with check (id = public.auth_business_id());

-- ---------------------------------------------------------------------
-- profiles: o usuário lê e atualiza apenas o próprio perfil.
-- ---------------------------------------------------------------------
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- Tabelas de dados do negócio: acesso total restrito ao próprio business.
-- ---------------------------------------------------------------------
drop policy if exists customers_all_own on public.customers;
create policy customers_all_own on public.customers
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());

drop policy if exists services_all_own on public.services;
create policy services_all_own on public.services
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());

drop policy if exists appointments_all_own on public.appointments;
create policy appointments_all_own on public.appointments
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());

drop policy if exists business_hours_all_own on public.business_hours;
create policy business_hours_all_own on public.business_hours
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());

drop policy if exists blocked_times_all_own on public.blocked_times;
create policy blocked_times_all_own on public.blocked_times
  for all to authenticated
  using (business_id = public.auth_business_id())
  with check (business_id = public.auth_business_id());
