create extension if not exists btree_gist;

create unique index if not exists room_prices_room_type_date_uidx
on public.room_prices (room_type_id, date);

create unique index if not exists blocked_dates_room_type_date_uidx
on public.blocked_dates (room_type_id, date);

create index if not exists reservations_active_room_type_date_idx
on public.reservations (room_type_id, check_in, check_out)
where reservation_status in ('pending', 'confirmed');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reservations_no_active_overlap'
  ) then
    alter table public.reservations
      add constraint reservations_no_active_overlap
      exclude using gist (
        room_type_id with =,
        daterange(check_in, check_out, '[)') with &&
      )
      where (reservation_status in ('pending', 'confirmed'));
  end if;
end
$$;

create or replace function public.admin_get_room_calendar(
  p_room_type_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  date date,
  effective_price integer,
  base_price integer,
  price_source text,
  is_blocked boolean,
  block_reason text,
  reservation_id uuid,
  reservation_status text,
  customer_name text
)
language sql
stable
security invoker
set search_path = public
as $$
  with room as (
    select rt.id, rt.base_price
    from public.room_types rt
    where rt.id = p_room_type_id
  ),
  days as (
    select generate_series(p_start_date, p_end_date, interval '1 day')::date as date
  )
  select
    d.date,
    coalesce(rp.price, room.base_price)::integer as effective_price,
    room.base_price::integer as base_price,
    case when rp.price is null then 'base' else 'override' end as price_source,
    (bd.id is not null) as is_blocked,
    bd.reason as block_reason,
    res.id as reservation_id,
    res.reservation_status,
    res.customer_name
  from days d
  cross join room
  left join public.room_prices rp
    on rp.room_type_id = room.id
   and rp.date = d.date
  left join public.blocked_dates bd
    on bd.room_type_id = room.id
   and bd.date = d.date
  left join lateral (
    select r.id, r.reservation_status, r.customer_name
    from public.reservations r
    where r.room_type_id = room.id
      and r.reservation_status in ('pending', 'confirmed')
      and d.date >= r.check_in
      and d.date < r.check_out
    order by r.created_at desc nulls last, r.id desc
    limit 1
  ) res on true
  order by d.date;
$$;

create or replace function public.admin_set_room_price_range(
  p_room_type_id uuid,
  p_start_date date,
  p_end_date date,
  p_price integer,
  p_apply_to text default 'all'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflict_date date;
  v_rows integer := 0;
begin
  if public.is_admin() is distinct from true then
    raise exception 'Unauthorized';
  end if;

  if p_start_date > p_end_date then
    raise exception 'Invalid date range';
  end if;

  if p_price <= 0 then
    raise exception 'Price must be greater than zero';
  end if;

  if p_apply_to not in ('all', 'weekdays', 'weekends') then
    raise exception 'Invalid apply_to value';
  end if;

  with target_dates as (
    select gs::date as date
    from generate_series(p_start_date, p_end_date, interval '1 day') gs
    where p_apply_to = 'all'
      or (p_apply_to = 'weekdays' and extract(isodow from gs) between 1 and 5)
      or (p_apply_to = 'weekends' and extract(isodow from gs) in (6, 7))
  )
  select td.date
  into v_conflict_date
  from target_dates td
  join public.reservations r
    on r.room_type_id = p_room_type_id
   and r.reservation_status in ('pending', 'confirmed')
   and td.date >= r.check_in
   and td.date < r.check_out
  limit 1;

  if v_conflict_date is not null then
    raise exception 'Cannot change price for booked date %', v_conflict_date;
  end if;

  insert into public.room_prices (room_type_id, date, price)
  select
    p_room_type_id,
    gs::date,
    p_price
  from generate_series(p_start_date, p_end_date, interval '1 day') gs
  where p_apply_to = 'all'
    or (p_apply_to = 'weekdays' and extract(isodow from gs) between 1 and 5)
    or (p_apply_to = 'weekends' and extract(isodow from gs) in (6, 7))
  on conflict (room_type_id, date)
  do update set price = excluded.price;

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

create or replace function public.admin_block_room_dates(
  p_room_type_id uuid,
  p_start_date date,
  p_end_date date,
  p_reason text default 'Manual block',
  p_apply_to text default 'all'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_block date;
  v_booked_date date;
  v_rows integer := 0;
begin
  if public.is_admin() is distinct from true then
    raise exception 'Unauthorized';
  end if;

  if p_start_date > p_end_date then
    raise exception 'Invalid date range';
  end if;

  if p_apply_to not in ('all', 'weekdays', 'weekends') then
    raise exception 'Invalid apply_to value';
  end if;

  with target_dates as (
    select gs::date as date
    from generate_series(p_start_date, p_end_date, interval '1 day') gs
    where p_apply_to = 'all'
      or (p_apply_to = 'weekdays' and extract(isodow from gs) between 1 and 5)
      or (p_apply_to = 'weekends' and extract(isodow from gs) in (6, 7))
  )
  select td.date
  into v_existing_block
  from target_dates td
  join public.blocked_dates bd
    on bd.room_type_id = p_room_type_id
   and bd.date = td.date
  limit 1;

  if v_existing_block is not null then
    raise exception 'Date % is already blocked', v_existing_block;
  end if;

  with target_dates as (
    select gs::date as date
    from generate_series(p_start_date, p_end_date, interval '1 day') gs
    where p_apply_to = 'all'
      or (p_apply_to = 'weekdays' and extract(isodow from gs) between 1 and 5)
      or (p_apply_to = 'weekends' and extract(isodow from gs) in (6, 7))
  )
  select td.date
  into v_booked_date
  from target_dates td
  join public.reservations r
    on r.room_type_id = p_room_type_id
   and r.reservation_status in ('pending', 'confirmed')
   and td.date >= r.check_in
   and td.date < r.check_out
  limit 1;

  if v_booked_date is not null then
    raise exception 'Cannot block booked date %', v_booked_date;
  end if;

  insert into public.blocked_dates (room_type_id, date, reason, sync_source)
  select
    p_room_type_id,
    gs::date,
    nullif(trim(coalesce(p_reason, 'Manual block')), ''),
    'manual'
  from generate_series(p_start_date, p_end_date, interval '1 day') gs
  where p_apply_to = 'all'
    or (p_apply_to = 'weekdays' and extract(isodow from gs) between 1 and 5)
    or (p_apply_to = 'weekends' and extract(isodow from gs) in (6, 7));

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

create or replace function public.admin_unblock_room_dates(
  p_room_type_id uuid,
  p_start_date date,
  p_end_date date,
  p_apply_to text default 'all'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer := 0;
begin
  if public.is_admin() is distinct from true then
    raise exception 'Unauthorized';
  end if;

  if p_start_date > p_end_date then
    raise exception 'Invalid date range';
  end if;

  if p_apply_to not in ('all', 'weekdays', 'weekends') then
    raise exception 'Invalid apply_to value';
  end if;

  delete from public.blocked_dates bd
  where bd.room_type_id = p_room_type_id
    and bd.date in (
      select gs::date
      from generate_series(p_start_date, p_end_date, interval '1 day') gs
      where p_apply_to = 'all'
        or (p_apply_to = 'weekdays' and extract(isodow from gs) between 1 and 5)
        or (p_apply_to = 'weekends' and extract(isodow from gs) in (6, 7))
    );

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

create or replace function public.create_reservation_with_pricing(
  p_room_type_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_check_in date,
  p_check_out date,
  p_guest_count_adult integer,
  p_guest_count_child integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base_price integer;
  v_blocked_date date;
  v_total_nights integer;
  v_total_price bigint;
  v_daily_breakdown jsonb;
  v_reservation_id uuid;
begin
  if p_check_in >= p_check_out then
    raise exception 'Check-out must be after check-in';
  end if;

  if coalesce(p_guest_count_adult, 0) < 1 then
    raise exception 'At least one adult guest is required';
  end if;

  select rt.base_price
  into v_base_price
  from public.room_types rt
  where rt.id = p_room_type_id;

  if v_base_price is null then
    raise exception 'Room type not found';
  end if;

  select bd.date
  into v_blocked_date
  from public.blocked_dates bd
  where bd.room_type_id = p_room_type_id
    and bd.date >= p_check_in
    and bd.date < p_check_out
  order by bd.date
  limit 1;

  if v_blocked_date is not null then
    raise exception 'Selected stay includes blocked date %', v_blocked_date;
  end if;

  with nightly_prices as (
    select
      d::date as date,
      coalesce(rp.price, v_base_price) as price,
      case when rp.price is null then 'base' else 'override' end as source
    from generate_series(p_check_in, p_check_out - interval '1 day', interval '1 day') d
    left join public.room_prices rp
      on rp.room_type_id = p_room_type_id
     and rp.date = d::date
  )
  select
    count(*)::integer,
    coalesce(sum(price), 0)::bigint,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'date', date,
          'price', price,
          'source', source
        )
        order by date
      ),
      '[]'::jsonb
    )
  into v_total_nights, v_total_price, v_daily_breakdown
  from nightly_prices;

  insert into public.reservations (
    room_type_id,
    customer_name,
    customer_phone,
    check_in,
    check_out,
    guest_count_adult,
    guest_count_child,
    subtotal,
    total_price,
    total_nights,
    reservation_status
  ) values (
    p_room_type_id,
    p_customer_name,
    p_customer_phone,
    p_check_in,
    p_check_out,
    p_guest_count_adult,
    p_guest_count_child,
    v_total_price,
    v_total_price,
    v_total_nights,
    'pending'
  )
  returning id into v_reservation_id;

  return jsonb_build_object(
    'reservation_id', v_reservation_id,
    'base_price', v_base_price,
    'total_nights', v_total_nights,
    'subtotal', v_total_price,
    'total_price', v_total_price,
    'daily_breakdown', v_daily_breakdown
  );
exception
  when exclusion_violation then
    raise exception 'Selected stay overlaps an existing reservation';
end;
$$;
