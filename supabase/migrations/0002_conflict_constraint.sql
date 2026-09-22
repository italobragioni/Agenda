-- =====================================================================
-- 0002_conflict_constraint.sql
-- Garantia, no próprio banco, de que NÃO existem dois agendamentos ativos
-- sobrepostos no mesmo estabelecimento. Isso torna impossível o
-- "duplo agendamento" mesmo com duas requisições simultâneas
-- (condição de corrida): o banco recusa a segunda inserção.
--
-- Observação (Fase 2): quando houver múltiplos boxes/profissionais,
-- basta trocar "business_id" por "resource_id" nesta restrição.
-- =====================================================================

-- Necessária para índices GiST combinando igualdade (=) e sobreposição (&&).
create extension if not exists btree_gist;

alter table public.appointments
  drop constraint if exists appointments_no_overlap;

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    business_id with =,
    tstzrange(start_at, end_at) with &&
  )
  where (status in ('scheduled', 'in_progress'));
