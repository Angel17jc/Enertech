-- AI assistant support tables
create table if not exists public.devices_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  avg_kw numeric(6,3) not null,
  min_kw numeric(6,3),
  max_kw numeric(6,3),
  typical_hours_per_day numeric(4,1),
  description text,
  locale text default 'EC',
  created_at timestamptz default now()
);

create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  role text not null check (role in ('user','assistant','system')),
  message text not null,
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists chat_history_user_idx on public.chat_history(user_id, created_at desc);
create index if not exists chat_history_session_idx on public.chat_history(session_id);

alter table public.devices
  add column if not exists catalog_id uuid references public.devices_catalog(id),
  add column if not exists source text not null default 'manual';
