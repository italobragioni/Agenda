-- =====================================================================
-- 0001_schema.sql
-- Estrutura de tabelas do Agenda (multi-tenant por business_id).
--
-- Decisões importantes:
--  * Valores monetários em CENTAVOS (integer) para evitar erros de
--    ponto flutuante. Ex.: R$ 80,00 = 8000.
--  * Timestamps em timestamptz (armazenados em UTC). A conversão para o
--    timezone do estabelecimento é feita ao ler/exibir.
--  * Cada agendamento guarda "snapshots" (nome/preço/duração no momento),
--    preservando o histórico mesmo que o serviço seja editado/desativado.
-- =====================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Função utilitária: atualiza automaticamente a coluna updated_at.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- businesses (estabelecimentos)
-- ---------------------------------------------------------------------
create table if not exists public.businesses (
  id                            uuid primary key default gen_random_uuid(),
  name                          text not null,
  slug                          text not null unique,
  phone                         text,
  whatsapp                      text,
  timezone                      text not null default 'America/Sao_Paulo',
  appointment_interval_minutes  integer not null default 0
                                  check (appointment_interval_minutes >= 0),
  onboarding_completed          boolean not null default false,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- profiles (dono do estabelecimento; 1:1 com auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  business_id  uuid not null references public.businesses(id) on delete cascade,
  full_name    text not null,
  role         text not null default 'owner' check (role in ('owner')),
  created_at   timestamptz not null default now()
);

create index if not exists idx_profiles_business_id
  on public.profiles(business_id);

-- ---------------------------------------------------------------------
-- customers (clientes finais)
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  name         text not null,
  phone        text not null, -- normalizado, ex.: 5531999999999
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (business_id, phone)
);

create index if not exists idx_customers_business_id
  on public.customers(business_id);

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- services (serviços)
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses(id) on delete cascade,
  name              text not null,
  description       text,
  price_cents       integer not null check (price_cents >= 0),
  duration_minutes  integer not null check (duration_minutes > 0),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_services_business_id
  on public.services(business_id);
create index if not exists idx_services_business_active
  on public.services(business_id, is_active);

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- appointments (agendamentos) — núcleo do sistema
-- ---------------------------------------------------------------------
create table if not exists public.appointments (
  id                       uuid primary key default gen_random_uuid(),
  business_id              uuid not null references public.businesses(id) on delete cascade,
  customer_id              uuid references public.customers(id) on delete set null,
  service_id               uuid references public.services(id) on delete set null,
  customer_name_snapshot   text not null,
  customer_phone_snapshot  text not null,
  service_name_snapshot    text not null,
  price_cents              integer not null check (price_cents >= 0),
  duration_minutes         integer not null check (duration_minutes > 0),
  start_at                 timestamptz not null,
  end_at                   timestamptz not null,
  status                   text not null default 'scheduled'
                             check (status in ('scheduled','in_progress',
                                               'completed','cancelled','no_show')),
  booking_source           text not null default 'admin'
                             check (booking_source in ('admin','public')),
  notes                    text,
  idempotency_key          text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists idx_appointments_business_start
  on public.appointments(business_id, start_at);
create index if not exists idx_appointments_business_status
  on public.appointments(business_id, status);
create index if not exists idx_appointments_customer
  on public.appointments(customer_id);

-- Evita agendamentos duplicados por dupla submissão (idempotência).
create unique index if not exists uq_appointments_idempotency
  on public.appointments(business_id, idempotency_key)
  where idempotency_key is not null;

create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- business_hours (horários de funcionamento por dia da semana)
-- weekday: 0 = domingo ... 6 = sábado (compatível com extract(dow))
-- ---------------------------------------------------------------------
create table if not exists public.business_hours (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  weekday      smallint not null check (weekday between 0 and 6),
  is_open      boolean not null default false,
  start_time   time,
  end_time     time,
  unique (business_id, weekday),
  check (
    (is_open = false) or
    (start_time is not null and end_time is not null and end_time > start_time)
  )
);

create index if not exists idx_business_hours_business
  on public.business_hours(business_id);

-- ---------------------------------------------------------------------
-- blocked_times (bloqueios: almoço, folga, férias, compromissos)
-- ---------------------------------------------------------------------
create table if not exists public.blocked_times (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  reason       text,
  created_at   timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists idx_blocked_times_business_start
  on public.blocked_times(business_id, start_at);
