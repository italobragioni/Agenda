-- =====================================================================
-- 0012_team_roles.sql
-- Permite usuários "funcionário" (staff) no mesmo estabelecimento, além do
-- dono (owner). Usado pelo recurso de equipe (plano Empresarial).
-- =====================================================================

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'staff'));
