-- =========================================================
-- Alinhar a base de dados remota com o projeto + fechar acessos dos torneios
-- =========================================================
-- Contexto (21/11/2026): as migrações 20261102000008 a 20261121200000 nunca correram pelo CLI;
-- parte foi feita à mão no SQL Editor. Esta migração cria só o que falta (é idempotente) e
-- as anteriores ficam marcadas como aplicadas com `supabase migration repair`.

-- ---------------------------------------------------------
-- 1. Torneios: RLS ligado, leitura pública, escrita só para staff ativo
-- ---------------------------------------------------------
-- Antes: RLS desligado; regras_qualificacao_torneio e apuramentos_torneio aceitavam
-- insert/update/delete de "anon" (qualquer visitante) e as outras tabelas de qualquer
-- utilizador com sessão (incluindo contas de adepto).
do $$
declare
  t text;
begin
  foreach t in array array[
    'torneios', 'criterios_torneio', 'fases_torneio', 'equipas_torneio', 'jogos_torneio',
    'regras_qualificacao_torneio', 'apuramentos_torneio'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "leitura publica" on public.%I', t);
    execute format('drop policy if exists "staff gere" on public.%I', t);
    execute format('create policy "leitura publica" on public.%I for select using (true)', t);
    execute format(
      'create policy "staff gere" on public.%I for all to authenticated
         using (public.is_admin_ativo()) with check (public.is_admin_ativo())', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------
-- 2. Partes em falta da 20261118000015_regras_qualificacao
-- ---------------------------------------------------------
alter table public.fases_torneio
  add column if not exists bloqueada boolean not null default false,
  add column if not exists tipo_jogo text default 'normal';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'fases_torneio_tipo_jogo_check') then
    alter table public.fases_torneio
      add constraint fases_torneio_tipo_jogo_check check (tipo_jogo in ('normal', 'penalti', 'disputa_terceiro'));
  end if;
end;
$$;

create table if not exists public.confrontos_diretos (
  id           uuid primary key default gen_random_uuid(),
  torneio_id   uuid not null references public.torneios(id) on delete cascade,
  fase_id      uuid not null references public.fases_torneio(id) on delete cascade,
  equipa_1_id  uuid not null references public.equipas_torneio(id) on delete restrict,
  equipa_2_id  uuid not null references public.equipas_torneio(id) on delete restrict,
  resultado    text,
  criado_em    timestamptz not null default now(),
  check (equipa_1_id <> equipa_2_id)
);
alter table public.confrontos_diretos enable row level security;
drop policy if exists "leitura publica" on public.confrontos_diretos;
drop policy if exists "staff gere" on public.confrontos_diretos;
create policy "leitura publica" on public.confrontos_diretos for select using (true);
create policy "staff gere" on public.confrontos_diretos for all to authenticated
  using (public.is_admin_ativo()) with check (public.is_admin_ativo());
revoke all on public.confrontos_diretos from anon, authenticated;
grant select on public.confrontos_diretos to anon;
grant select, insert, update, delete on public.confrontos_diretos to authenticated;

-- ---------------------------------------------------------
-- 3. Webhooks (20261119000020, com as policies corrigidas: perfis tem id/papel, não user_id/role)
-- ---------------------------------------------------------
create table if not exists public.webhooks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamp not null default now(),
  updated_at  timestamp not null default now(),
  created_by  uuid not null references auth.users(id) on delete cascade,
  event_type  text not null,
  url         text not null,
  secret      text,
  active      boolean default true,
  constraint webhook_url_format check (url ~ '^https?://')
);
alter table public.webhooks enable row level security;
drop policy if exists "Only super admins can manage webhooks" on public.webhooks;
create policy "Only super admins can manage webhooks" on public.webhooks for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create table if not exists public.webhook_logs (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamp not null default now(),
  webhook_id       uuid not null references public.webhooks(id) on delete cascade,
  event_type       text not null,
  event_data       jsonb not null,
  response_status  integer,
  response_body    text,
  error_message    text,
  success          boolean
);
alter table public.webhook_logs enable row level security;
drop policy if exists "Only super admins can view webhook logs" on public.webhook_logs;
create policy "Only super admins can view webhook logs" on public.webhook_logs for select to authenticated
  using (public.is_super_admin());

create index if not exists webhook_logs_webhook_id_idx on public.webhook_logs (webhook_id);
create index if not exists webhook_logs_event_type_idx on public.webhook_logs (event_type);
create index if not exists webhooks_active_idx on public.webhooks (active) where active = true;

revoke all on public.webhooks, public.webhook_logs from anon, authenticated;
grant select, insert, update, delete on public.webhooks to authenticated;
grant select on public.webhook_logs to authenticated;

-- ---------------------------------------------------------
-- 4. Auditoria e limite de tentativas (estavam em migrations/, fora do Supabase)
-- ---------------------------------------------------------
-- Só o servidor (service_role) escreve; o super-admin pode ler a auditoria.
create table if not exists public.audit_logs (
  id             bigserial primary key,
  user_id        uuid references auth.users(id) on delete set null,
  action         text not null,
  resource_type  text,
  resource_id    text,
  details        jsonb,
  ip_address     text,
  user_agent     text,
  status         text not null check (status in ('success', 'failure')),
  error_message  text,
  created_at     timestamptz default now()
);
create index if not exists idx_audit_logs_user_id on public.audit_logs (user_id);
create index if not exists idx_audit_logs_action on public.audit_logs (action);
create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_resource on public.audit_logs (resource_type, resource_id);
alter table public.audit_logs enable row level security;
drop policy if exists "Audit logs readable by admins only" on public.audit_logs;
create policy "Audit logs readable by admins only" on public.audit_logs for select to authenticated
  using (public.is_super_admin());
revoke all on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

create table if not exists public.rate_limits (
  key         text primary key,
  attempts    integer not null default 1,
  reset_at    timestamptz not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_rate_limits_reset_at on public.rate_limits (reset_at);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.cleanup_old_audit_logs() returns void
language sql security definer set search_path = '' as $$
  delete from public.audit_logs where created_at < now() - interval '90 days';
$$;
create or replace function public.cleanup_expired_rate_limits() returns void
language sql security definer set search_path = '' as $$
  delete from public.rate_limits where reset_at < now();
$$;
revoke execute on function public.cleanup_old_audit_logs() from public, anon, authenticated;
revoke execute on function public.cleanup_expired_rate_limits() from public, anon, authenticated;

-- ---------------------------------------------------------
-- 5. service_role: permissões normais do Supabase (só o servidor tem esta chave)
-- ---------------------------------------------------------
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
