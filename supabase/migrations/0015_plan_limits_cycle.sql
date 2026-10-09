-- =====================================================================
-- 0015_plan_limits_cycle.sql
-- Limites por plano aplicados no servidor + contagem por CICLO da assinatura.
--
-- 1) Novas colunas em businesses:
--    - current_period_start: início do ciclo vigente (gravado pelo webhook da
--      Cakto a cada pagamento confirmado). A cota reinicia a cada ciclo.
--    - appointment_limit_override: limite contratado para grandfathering de
--      assinantes antigos (null = usa o limite do plano). Nunca é alterado
--      automaticamente — é a "estratégia de migração" sem mudar direitos.
--
-- 2) create_appointment passa a impor, DENTRO da transação e sob o advisory
--    lock por estabelecimento (atômico contra corrida):
--    - plano ativo (paid_until no futuro)         -> PLANO_EXPIRADO
--    - cota do ciclo não excedida                 -> LIMITE_ATINGIDO
--
-- Limites (MANTER EM SINCRONIA com src/features/billing/plan.ts):
--    Essencial (basic): 20 por ciclo | Premium: 70 | Empresarial: ilimitado
-- =====================================================================

alter table public.businesses
  add column if not exists current_period_start timestamptz,
  add column if not exists appointment_limit_override integer
    check (appointment_limit_override is null or appointment_limit_override >= 0);

create or replace function public.create_appointment(
  p_business_id      uuid,
  p_service_id       uuid,
  p_customer_name    text,
  p_customer_phone   text,
  p_start_at         timestamptz,
  p_booking_source   text default 'admin',
  p_price_cents      integer default null,
  p_duration_minutes integer default null,
  p_notes            text default null,
  p_idempotency_key  text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business    public.businesses%rowtype;
  v_service     public.services%rowtype;
  v_hours       public.business_hours%rowtype;
  v_customer_id uuid;
  v_price       integer;
  v_duration    integer;
  v_end_at      timestamptz;
  v_tz          text;
  v_local_start timestamp;
  v_local_end   timestamp;
  v_weekday     smallint;
  v_capacity    integer;
  v_interval    integer;
  v_conflicts   integer;
  v_limit       integer;
  v_cycle_start timestamptz;
  v_used        integer;
  v_result      public.appointments%rowtype;
begin
  if auth.uid() is not null and p_business_id <> public.auth_business_id() then
    raise exception 'ACESSO_NEGADO';
  end if;

  -- Idempotência (retorna o já criado sem consumir cota de novo).
  if p_idempotency_key is not null then
    select * into v_result from public.appointments
     where business_id = p_business_id and idempotency_key = p_idempotency_key
     limit 1;
    if found then return v_result; end if;
  end if;

  select * into v_business from public.businesses where id = p_business_id;
  if not found then raise exception 'NEGOCIO_INVALIDO'; end if;
  v_tz := v_business.timezone;
  v_capacity := greatest(coalesce(v_business.capacity, 1), 1);
  v_interval := coalesce(v_business.appointment_interval_minutes, 0);

  -- Plano precisa estar ativo (pagamento confirmado e dentro do período).
  if v_business.paid_until is null or v_business.paid_until <= now() then
    raise exception 'PLANO_EXPIRADO';
  end if;

  -- Limite de agendamentos do plano (override tem prioridade).
  v_limit := case v_business.plan
               when 'basic'   then 20
               when 'premium' then 70
               else null  -- empresarial = ilimitado
             end;
  if v_business.appointment_limit_override is not null then
    v_limit := v_business.appointment_limit_override;
  end if;

  select * into v_service
    from public.services where id = p_service_id and business_id = p_business_id;
  if not found then raise exception 'SERVICO_INVALIDO'; end if;
  if p_booking_source = 'public' and v_service.is_active = false then
    raise exception 'SERVICO_INVALIDO';
  end if;

  v_price    := coalesce(p_price_cents, v_service.price_cents);
  v_duration := coalesce(p_duration_minutes, v_service.duration_minutes);
  if v_duration <= 0 then raise exception 'SERVICO_INVALIDO'; end if;
  v_end_at := p_start_at + make_interval(mins => v_duration);

  if p_booking_source = 'public' and p_start_at < now() then
    raise exception 'DATA_PASSADA';
  end if;

  -- Horário de funcionamento.
  v_local_start := p_start_at at time zone v_tz;
  v_local_end   := v_end_at   at time zone v_tz;
  v_weekday     := extract(dow from v_local_start)::smallint;
  select * into v_hours from public.business_hours
   where business_id = p_business_id and weekday = v_weekday;
  if not found or v_hours.is_open = false then raise exception 'FECHADO'; end if;
  if v_local_start::time < v_hours.start_time
     or v_local_end::time > v_hours.end_time
     or v_local_end::date <> v_local_start::date then
    raise exception 'FORA_DO_HORARIO';
  end if;

  -- Serializa reservas do mesmo negócio (evita corrida sem a restrição).
  perform pg_advisory_xact_lock(hashtext('carvi_booking:' || p_business_id::text));

  -- Cota do CICLO (sob o lock -> duas solicitações simultâneas não ultrapassam).
  -- Consumo = agendamentos criados no ciclo vigente que não foram cancelados.
  if v_limit is not null then
    if v_business.current_period_start is not null
       and v_business.current_period_start <= now() then
      v_cycle_start := v_business.current_period_start;
    else
      v_cycle_start := date_trunc('month', (now() at time zone v_tz)) at time zone v_tz;
    end if;

    select count(*) into v_used
      from public.appointments a
     where a.business_id = p_business_id
       and a.status <> 'cancelled'
       and a.created_at >= v_cycle_start;

    if v_used >= v_limit then
      raise exception 'LIMITE_ATINGIDO';
    end if;
  end if;

  -- Bloqueios ocupam todo o estabelecimento.
  if exists (
    select 1 from public.blocked_times b
     where b.business_id = p_business_id
       and tstzrange(b.start_at, b.end_at) && tstzrange(p_start_at, v_end_at)
  ) then
    raise exception 'BLOQUEADO';
  end if;

  -- Capacidade: conta agendamentos ativos que conflitam (com intervalo).
  select count(*) into v_conflicts
    from public.appointments a
   where a.business_id = p_business_id
     and a.status in ('scheduled', 'in_progress')
     and tstzrange(
           a.start_at - make_interval(mins => v_interval),
           a.end_at   + make_interval(mins => v_interval)
         ) && tstzrange(p_start_at, v_end_at);

  if v_conflicts >= v_capacity then
    raise exception 'HORARIO_INDISPONIVEL';
  end if;

  -- Localiza ou cria o cliente.
  insert into public.customers (business_id, name, phone)
       values (p_business_id, p_customer_name, p_customer_phone)
  on conflict (business_id, phone)
    do update set name = excluded.name, updated_at = now()
    returning id into v_customer_id;

  begin
    insert into public.appointments (
      business_id, customer_id, service_id,
      customer_name_snapshot, customer_phone_snapshot, service_name_snapshot,
      price_cents, duration_minutes, start_at, end_at,
      status, booking_source, notes, idempotency_key
    ) values (
      p_business_id, v_customer_id, v_service.id,
      p_customer_name, p_customer_phone, v_service.name,
      v_price, v_duration, p_start_at, v_end_at,
      'scheduled', p_booking_source, p_notes, p_idempotency_key
    )
    returning * into v_result;
  exception
    when unique_violation then
      -- Corrida na idempotência: retorna o agendamento já criado.
      select * into v_result from public.appointments
       where business_id = p_business_id and idempotency_key = p_idempotency_key
       limit 1;
      if not found then raise exception 'HORARIO_INDISPONIVEL'; end if;
  end;

  return v_result;
end;
$$;
