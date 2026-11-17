-- 0025: chave Pix do recebedor (mostrada ao cliente ao concluir o agendamento)
alter table public.businesses
  add column if not exists pix_key  text,
  add column if not exists pix_name text,
  add column if not exists pix_city text;
