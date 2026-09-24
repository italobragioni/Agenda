-- =====================================================================
-- 0006_logo.sql
-- Logo própria de cada estabelecimento, exibida na página pública.
-- A imagem é guardada no Supabase Storage; aqui salvamos apenas a URL.
-- =====================================================================

alter table public.businesses
  add column if not exists logo_url text;
