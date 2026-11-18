-- =========================================================
-- Reformulação: Suporte a Regras de Qualificação Flexíveis
-- =========================================================

-- Enums para tipos de qualificação
create type public.tipo_qualificacao as enum (
  'apuramento_direto',      -- Avança diretamente (ex: 1º de cada grupo)
  'disputa',                -- Disputa num outro formato (ex: 3º/4º lugares)
  'liga_secundaria',        -- Liga de consolação/prata (ex: 5º-8º vão para liga de prata)
  'eliminatoria',           -- Vai direto para eliminatória
  'melhores_terceiros'      -- Melhores 3º classificados
);

create type public.criterio_seleção_equipas as enum (
  'posicao',                -- Por posição no grupo (1º, 2º, 3º, etc.)
  'melhores_terceiros',     -- Melhores 3º classificados
  'todos_de_posicao',       -- Todos de uma posição específica
  'manual'                  -- Manual, escolhido pelo admin
);

-- Tabela para armazenar as regras de qualificação de um torneio
create table public.regras_qualificacao_torneio (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,

  -- Identificação
  nome            text not null,                    -- ex: "Campeões de Grupo", "Liga de Ouro"
  descricao       text,                             -- ex: "1º classificado de cada grupo"
  ordem           smallint not null check (ordem > 0),

  -- Tipo de qualificação
  tipo            public.tipo_qualificacao not null,
  criterio        public.criterio_seleção_equipas not null,

  -- Configuração de seleção
  num_equipas     smallint not null check (num_equipas > 0),
  posicoes        smallint[] default '{}',          -- ex: [1, 2] para 1º e 2º

  -- Fase/Grupo de destino
  fase_destino_id uuid references public.fases_torneio(id) on delete set null,

  -- Metadados
  criado_em       timestamptz not null default now(),

  unique (torneio_id, ordem)
);

-- Tabela para registar o apuramento de equipas (qual equipa foi apurada por qual regra)
create table public.apuramentos_torneio (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,
  regra_id        uuid not null references public.regras_qualificacao_torneio(id) on delete cascade,
  equipa_id       uuid not null references public.equipas_torneio(id) on delete cascade,

  -- Metadados
  criado_em       timestamptz not null default now(),

  unique (torneio_id, equipa_id, regra_id)
);

-- Tabela para armazenar confrontos diretos entre equipas (para critério de desempate)
create table public.confrontos_diretos (
  id              uuid primary key default gen_random_uuid(),
  torneio_id      uuid not null references public.torneios(id) on delete cascade,
  fase_id         uuid not null references public.fases_torneio(id) on delete cascade,

  equipa_1_id     uuid not null references public.equipas_torneio(id) on delete restrict,
  equipa_2_id     uuid not null references public.equipas_torneio(id) on delete restrict,

  resultado       text,                             -- ex: "1-0", "2-2", null se não jogado

  criado_em       timestamptz not null default now(),

  check (equipa_1_id != equipa_2_id)
);

-- Campo na tabela de fases para indicar se é uma fase eliminatória bloqueada
alter table public.fases_torneio
  add column bloqueada boolean not null default false,
  add column tipo_jogo text default 'normal' check (tipo_jogo in ('normal', 'penalti', 'disputa_terceiro'));
