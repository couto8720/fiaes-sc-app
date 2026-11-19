-- Create webhooks table
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,

  event_type text not null,
  url text not null,
  secret text,
  active boolean default true,

  constraint webhook_url_format check (url ~ '^https?://')
);

-- Enable RLS
alter table public.webhooks enable row level security;

-- Create RLS policy for super admins only
create policy "Only super admins can manage webhooks"
on public.webhooks
for all
using (
  exists (
    select 1 from public.perfis
    where user_id = auth.uid() and role = 'super_admin'
  )
);

-- Create webhook logs table
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp not null default now(),
  webhook_id uuid not null references public.webhooks(id) on delete cascade,

  event_type text not null,
  event_data jsonb not null,
  response_status integer,
  response_body text,
  error_message text,
  success boolean,

  constraint webhook_logs_success_check check (success in (true, false))
);

-- Enable RLS
alter table public.webhook_logs enable row level security;

-- Create RLS policy for super admins only
create policy "Only super admins can view webhook logs"
on public.webhook_logs
for select
using (
  exists (
    select 1 from public.perfis
    where user_id = auth.uid() and role = 'super_admin'
  )
);

-- Create indexes
create index webhook_logs_webhook_id_idx on public.webhook_logs(webhook_id);
create index webhook_logs_event_type_idx on public.webhook_logs(event_type);
create index webhooks_active_idx on public.webhooks(active) where active = true;
