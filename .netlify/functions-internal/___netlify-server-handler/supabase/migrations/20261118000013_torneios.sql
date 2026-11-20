-- =========================================================
-- Tabelas para Torneios
-- =========================================================

create type public.formato_torneio as enum ('grupos', 'eliminatoria', 'grupos_eliminatoria', 'suico');
create type public.tipo_fase as enum ('grupo', 'eliminatoria');
create type public.criterio_classificacao as enum ('pontos', 'diferenca_golo', 'golo_marcado', 'confronto_direto', 'sorteio');
create type public.estado_torneio as enum ('planejamento', 'em_curso', 'fase_grupos', 'fase_eliminatoria', 'terminado');

create table public.torneios (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  descricao       text,
  data_inicio     date,
  data_fim        date,

  -- FORMATO
  formato         public.formato_torneio not null,
  num_grupos      smallint check (num_grupos > 0),
  equipas_por_grupo smallint check (equipas_por_grupo > 0),
  avancar_por_grupo smallint check (avancar_por_grupo > 0),

  -- REGRAS
  vitoria_pontos  smallint not null default 3,
  empate_pontos   smallint not null default 1,

  -- ESTADO
  estado          public.estado_torneio not null default 'planejamento',
  escalao_id      uuid references public.escaloes(id) on delete set null,

  -- METADATA
  criado_por      uuid not null references auth.users(id) on delete restrict,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create table public.criterios_torneio (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,

  ordem           smallint not null check (ordem > 0),
  criterio        public.criterio_classificacao not null,
  direcao         text not null default 'DESC' check (direcao in ('DESC', 'ASC')),

  unique (torneio_id, ordem)
);

create table public.fases_torneio (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,

  nome            text not null,
  tipo            public.tipo_fase not null,
  numero_grupo    smallint,

  estado          public.estado_torneio not null default 'planejamento',
  criado_em       timestamptz not null default now()
);

create table public.equipas_torneio (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,
  fase_torneio_id uuid not null references public.fases_torneio(id) on delete cascade,

  nome            text not null,
  escalao_id      uuid references public.escaloes(id) on delete set null,

  -- ESTATÍSTICAS (atualizadas automaticamente)
  jogos           smallint not null default 0 check (jogos >= 0),
  vitorias        smallint not null default 0 check (vitorias >= 0),
  empates         smallint not null default 0 check (empates >= 0),
  derrotas        smallint not null default 0 check (derrotas >= 0),
  golos_marcados  smallint not null default 0 check (golos_marcados >= 0),
  golos_sofridos  smallint not null default 0 check (golos_sofridos >= 0),
  pontos          smallint not null default 0,

  posicao_grupo   smallint,

  criado_em       timestamptz not null default now(),
  unique (torneio_id, fase_torneio_id, escalao_id)
);

create table public.jogos_torneio (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,
  fase_torneio_id uuid references public.fases_torneio(id) on delete set null,

  -- PODE REFERENCIAR UM JOGO NORMAL
  jogo_id         uuid references public.jogos(id) on delete set null,

  -- OU SER INDEPENDENTE
  equipa_1_id     uuid not null references public.equipas_torneio(id) on delete restrict,
  equipa_2_id     uuid not null references public.equipas_torneio(id) on delete restrict,

  golos_equipa_1  smallint check (golos_equipa_1 >= 0),
  golos_equipa_2  smallint check (golos_equipa_2 >= 0),

  data_hora       timestamptz,
  local_id        uuid references public.locais(id) on delete set null,

  estado          public.estado_jogo not null default 'agendado',

  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),

  check (equipa_1_id != equipa_2_id)
);

-- =========================================================
-- Triggers para auto-calcular estatísticas
-- =========================================================

create function public.atualizar_stats_equipa_torneio() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_jogos integer;
  v_vitorias integer;
  v_empates integer;
  v_derrotas integer;
  v_gm integer;
  v_gs integer;
  v_pontos integer;
begin
  -- Calcular estatísticas para equipa_1
  select
    count(*) filter (where estado = 'final'),
    count(*) filter (where estado = 'final' and golos_equipa_1 > golos_equipa_2),
    count(*) filter (where estado = 'final' and golos_equipa_1 = golos_equipa_2),
    count(*) filter (where estado = 'final' and golos_equipa_1 < golos_equipa_2),
    coalesce(sum(golos_equipa_1) filter (where estado = 'final'), 0),
    coalesce(sum(golos_equipa_2) filter (where estado = 'final'), 0)
  into v_jogos, v_vitorias, v_empates, v_derrotas, v_gm, v_gs
  from public.jogos_torneio
  where equipa_1_id = new.equipa_1_id and estado = 'final';

  v_pontos := (v_vitorias * (select vitoria_pontos from public.torneios where id = new.torneio_id))
            + (v_empates * (select empate_pontos from public.torneios where id = new.torneio_id));

  update public.equipas_torneio
  set jogos = v_jogos, vitorias = v_vitorias, empates = v_empates, derrotas = v_derrotas,
      golos_marcados = v_gm, golos_sofridos = v_gs, pontos = v_pontos
  where id = new.equipa_1_id;

  -- Mesmo para equipa_2
  select
    count(*) filter (where estado = 'final'),
    count(*) filter (where estado = 'final' and golos_equipa_2 > golos_equipa_1),
    count(*) filter (where estado = 'final' and golos_equipa_2 = golos_equipa_1),
    count(*) filter (where estado = 'final' and golos_equipa_2 < golos_equipa_1),
    coalesce(sum(golos_equipa_2) filter (where estado = 'final'), 0),
    coalesce(sum(golos_equipa_1) filter (where estado = 'final'), 0)
  into v_jogos, v_vitorias, v_empates, v_derrotas, v_gm, v_gs
  from public.jogos_torneio
  where equipa_2_id = new.equipa_2_id and estado = 'final';

  v_pontos := (v_vitorias * (select vitoria_pontos from public.torneios where id = new.torneio_id))
            + (v_empates * (select empate_pontos from public.torneios where id = new.torneio_id));

  update public.equipas_torneio
  set jogos = v_jogos, vitorias = v_vitorias, empates = v_empates, derrotas = v_derrotas,
      golos_marcados = v_gm, golos_sofridos = v_gs, pontos = v_pontos
  where id = new.equipa_2_id;

  return new;
end;
$$;

create trigger atualizar_stats_jogo_torneio
  after insert or update on public.jogos_torneio
  for each row execute function public.atualizar_stats_equipa_torneio();
