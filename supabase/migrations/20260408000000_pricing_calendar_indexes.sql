-- Optimizes admin pricing calendar and public daily price lookups.
-- These indexes match the most frequent filters:
-- room_type_id + date for room_prices and blocked_dates,
-- and active/valid promo lookup for public VillaCard pricing.

create index if not exists room_prices_room_type_date_idx
on public.room_prices (room_type_id, date)
where room_type_id is not null;

create index if not exists blocked_dates_room_type_date_idx
on public.blocked_dates (room_type_id, date)
where room_type_id is not null;

create index if not exists promos_active_expiry_discount_idx
on public.promos (expired_at, discount_value desc)
where is_active is true;
