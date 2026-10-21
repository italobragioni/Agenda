-- =====================================================================
-- 0020_branding_override.sql
-- Cortesia de marca: libera a logo (branding) para um estabelecimento
-- mesmo em plano que normalmente não inclui o recurso.
-- =====================================================================

alter table public.businesses
  add column if not exists branding_override boolean not null default false;
