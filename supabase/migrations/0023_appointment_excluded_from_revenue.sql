-- 0023: permite tirar um atendimento finalizado do faturamento
-- (ele continua na agenda como histórico, mas não conta no Financeiro).
alter table public.appointments
  add column if not exists excluded_from_revenue boolean not null default false;
