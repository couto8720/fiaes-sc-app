-- =========================================================
-- Esquema base: escalões, locais, jogos, classificações, perfis
-- =========================================================

create type public.estado_jogo as enum (
  'agendado', 'primeira_parte', 'intervalo', 'segunda_parte', 'final', 'adiado', 'cancelado'
);

create type public.papel_admin as enum ('super_admin', 'treinador');

-- Configuração do clube (uma única linha)
create table public.clube_config (
  id              boolean primary key default true check (id),
  nome            text not null,
  nome_curto      text not null,
  logo_url        text,
  cor_primaria    text not null default '#0B3D91' check (cor_primaria ~ '^#[0-9A-Fa-f]{6}$'),
  cor_secundaria  text not null default '#FFFFFF' check (cor_secundaria ~ '^#[0-9A-Fa-f]{6}$'),
  cor_destaque    text not null default '#F2C200' check (cor_destaque ~ '^#[0-9A-Fa-f]{6}$'),
  hashtag         text default '#VamosClube'
);

create table public.escaloes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  ordem       smallint not null default 0,
  epoca       text not null,
  competicao  text,
  ativo       boolean not null default true
);

create table public.locais (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  morada    text,
  maps_url  text
);

create table public.jogos (
  id                   uuid primary key default gen_random_uuid(),
  escalao_id           uuid not null references public.escaloes(id) on delete cascade,
  competicao           text,
  jornada              smallint check (jornada > 0),
  data_hora            timestamptz not null,
  local_id             uuid references public.locais(id) on delete set null,
  em_casa              boolean not null,
  adversario           text not null,
  adversario_logo_url  text,
  golos_clube          smallint check (golos_clube >= 0),
  golos_adversario     smallint check (golos_adversario >= 0),
  estado               public.estado_jogo not null default 'agendado',
  estado_desde         timestamptz not null default now(),
  notas                text,
  atualizado_por       uuid references auth.users(id) on delete set null,
  atualizado_em        timestamptz not null default now()
);
create index jogos_data_hora_idx on public.jogos (data_hora);
create index jogos_escalao_data_idx on public.jogos (escalao_id, data_hora);

create table public.classificacoes (
  id              uuid primary key default gen_random_uuid(),
  escalao_id      uuid not null references public.escaloes(id) on delete cascade,
  posicao         smallint not null check (posicao > 0),
  equipa          text not null,
  e_o_clube       boolean not null default false,
  jogos           smallint not null default 0 check (jogos >= 0),
  vitorias        smallint not null default 0 check (vitorias >= 0),
  empates         smallint not null default 0 check (empates >= 0),
  derrotas        smallint not null default 0 check (derrotas >= 0),
  golos_marcados  smallint not null default 0 check (golos_marcados >= 0),
  golos_sofridos  smallint not null default 0 check (golos_sofridos >= 0),
  pontos          smallint not null default 0,
  atualizado_em   timestamptz not null default now(),
  unique (escalao_id, equipa)
);

create table public.perfis (
  id     uuid primary key references auth.users(id) on delete cascade,
  nome   text not null,
  papel  public.papel_admin not null default 'treinador',
  ativo  boolean not null default true
);

create table public.perfis_escaloes (
  perfil_id   uuid not null references public.perfis(id) on delete cascade,
  escalao_id  uuid not null references public.escaloes(id) on delete cascade,
  primary key (perfil_id, escalao_id)
);
create index perfis_escaloes_escalao_idx on public.perfis_escaloes (escalao_id);

-- =========================================================
-- Triggers
-- =========================================================

-- Jogos: carimbo de tempo, autor e 0-0 automático ao começar.
create function public.jogos_antes_de_gravar() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();

  if tg_op = 'INSERT' or new.estado is distinct from old.estado then
    new.estado_desde := now();
  end if;

  if new.estado in ('primeira_parte', 'intervalo', 'segunda_parte', 'final') then
    new.golos_clube := coalesce(new.golos_clube, 0);
    new.golos_adversario := coalesce(new.golos_adversario, 0);
  end if;

  return new;
end;
$$;

create trigger jogos_antes_de_gravar
  before insert or update on public.jogos
  for each row execute function public.jogos_antes_de_gravar();

create function public.tocar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger classificacoes_atualizado_em
  before update on public.classificacoes
  for each row execute function public.tocar_atualizado_em();

-- Cada utilizador novo (convidado pelo super-admin) recebe um perfil de treinador sem escalões.
create function public.criar_perfil_novo_utilizador() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', new.email, 'Sem nome'));
  return new;
end;
$$;

create trigger criar_perfil_novo_utilizador
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_utilizador();
