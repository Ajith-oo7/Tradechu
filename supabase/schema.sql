-- Tradechu Supabase schema
-- Run in the Supabase SQL editor. Enable Anonymous sign-ins in Auth settings.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar text default 'T',
  avatar_gradient text default 'from-yellow-400 to-orange-500',
  quiet_hours boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.cards (
  id text primary key,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  list text not null check (list in ('wishlist', 'binder')),
  name text not null,
  rarity text,
  image_gradient text,
  photo_url text,
  api_image_url text,
  set_name text,
  card_number text,
  condition text,
  note text,
  updated_at timestamptz default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  category text,
  venue text,
  address text,
  date date not null,
  start_time text,
  end_time text,
  distance_miles numeric,
  lat double precision,
  lng double precision,
  attendees int default 0,
  description text,
  details jsonb default '[]'::jsonb,
  gradient text
);

create table if not exists public.event_rsvps (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  status text not null check (status in ('going', 'confirmed')),
  updated_at timestamptz default now(),
  primary key (user_id, event_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  event_id text references public.events(id) on delete set null,
  trade_give text,
  trade_receive text,
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "profiles read all" on public.profiles for select using (true);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);

create policy "cards read all" on public.cards for select using (true);
create policy "cards write own" on public.cards for all using (auth.uid() = owner_id);

create policy "events read all" on public.events for select using (true);
create policy "events insert authenticated" on public.events for insert with check (auth.role() = 'authenticated');

create policy "rsvps read all" on public.event_rsvps for select using (true);
create policy "rsvps write own" on public.event_rsvps for all using (auth.uid() = user_id);

create policy "conversations participants" on public.conversations for all
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "messages participants" on public.messages for all
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "push own" on public.push_subscriptions for all using (auth.uid() = user_id);
