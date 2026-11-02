-- Instalação completa da base de dados do Fiães SC (gerado a partir de supabase/migrations).
-- Corre tudo numa só transação: ou fica tudo instalado, ou nada.

-- ===== 20261028000001_esquema.sql =====
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


-- ===== 20261028000002_rls.sql =====
-- =========================================================
-- Regras de acesso (RLS)
--   Público (anon): só leitura de config, escalões, locais, jogos e classificações.
--   Treinador: edita jogos e classificações dos escalões que lhe foram atribuídos.
--   Super-admin: gere tudo.
-- =========================================================

-- Funções auxiliares. "security definer" para lerem perfis sem entrar em recursão com o RLS.
create function public.is_admin_ativo() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis where id = auth.uid() and ativo);
$$;

create function public.is_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and ativo and papel = 'super_admin'
  );
$$;

create function public.pode_editar_escalao(e uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_super_admin() or exists (
    select 1
    from public.perfis p
    join public.perfis_escaloes pe on pe.perfil_id = p.id
    where p.id = auth.uid() and p.ativo and pe.escalao_id = e
  );
$$;

alter table public.clube_config    enable row level security;
alter table public.escaloes        enable row level security;
alter table public.locais          enable row level security;
alter table public.jogos           enable row level security;
alter table public.classificacoes  enable row level security;
alter table public.perfis          enable row level security;
alter table public.perfis_escaloes enable row level security;

-- Leitura pública
create policy "leitura publica" on public.clube_config   for select using (true);
create policy "leitura publica" on public.escaloes       for select using (true);
create policy "leitura publica" on public.locais         for select using (true);
create policy "leitura publica" on public.jogos          for select using (true);
create policy "leitura publica" on public.classificacoes for select using (true);

-- Jogos e classificações: só quem tem o escalão.
-- O WITH CHECK impede também mover um jogo para um escalão que não é seu.
create policy "criar jogos" on public.jogos for insert to authenticated
  with check (public.pode_editar_escalao(escalao_id));
create policy "editar jogos" on public.jogos for update to authenticated
  using (public.pode_editar_escalao(escalao_id))
  with check (public.pode_editar_escalao(escalao_id));
create policy "apagar jogos" on public.jogos for delete to authenticated
  using (public.pode_editar_escalao(escalao_id));

create policy "criar classificacao" on public.classificacoes for insert to authenticated
  with check (public.pode_editar_escalao(escalao_id));
create policy "editar classificacao" on public.classificacoes for update to authenticated
  using (public.pode_editar_escalao(escalao_id))
  with check (public.pode_editar_escalao(escalao_id));
create policy "apagar classificacao" on public.classificacoes for delete to authenticated
  using (public.pode_editar_escalao(escalao_id));

-- Estrutura do clube: só super-admin
create policy "gerir config" on public.clube_config for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
create policy "gerir escaloes" on public.escaloes for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Locais: qualquer admin ativo cria e edita (um treinador pode precisar de um campo novo);
-- só o super-admin apaga.
create policy "criar locais" on public.locais for insert to authenticated
  with check (public.is_admin_ativo());
create policy "editar locais" on public.locais for update to authenticated
  using (public.is_admin_ativo()) with check (public.is_admin_ativo());
create policy "apagar locais" on public.locais for delete to authenticated
  using (public.is_super_admin());

-- Perfis: cada um vê o seu; o super-admin vê e gere todos.
create policy "ver perfil" on public.perfis for select to authenticated
  using (id = auth.uid() or public.is_super_admin());
create policy "gerir perfis" on public.perfis for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "ver atribuicoes" on public.perfis_escaloes for select to authenticated
  using (perfil_id = auth.uid() or public.is_super_admin());
create policy "gerir atribuicoes" on public.perfis_escaloes for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());


-- ===== 20261028000003_realtime.sql =====
-- Tempo real: o público recebe as alterações de marcador e estado dos jogos.
alter publication supabase_realtime add table public.jogos;


-- ===== 20261028000004_permissoes.sql =====
-- Permissões explícitas por tabela (camada antes do RLS).
-- Não depende das permissões por omissão do projeto e garante que o público nunca tem permissão de escrita.

revoke all on public.clube_config, public.escaloes, public.locais, public.jogos,
              public.classificacoes, public.perfis, public.perfis_escaloes
  from anon, authenticated;

-- Público: só leitura das tabelas públicas.
grant select on public.clube_config, public.escaloes, public.locais, public.jogos, public.classificacoes
  to anon;

-- Staff autenticado: leitura e escrita; o RLS decide o quê.
grant select, insert, update, delete
  on public.clube_config, public.escaloes, public.locais, public.jogos,
     public.classificacoes, public.perfis, public.perfis_escaloes
  to authenticated;


-- ===== 20261028000005_perfis_email.sql =====
-- Email no perfil, para o super-admin ver quem é quem na lista de utilizadores
-- (auth.users não é acessível pela API pública).
alter table public.perfis add column email text;

update public.perfis p set email = u.email from auth.users u where u.id = p.id;

create or replace function public.criar_perfil_novo_utilizador() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', new.email, 'Sem nome'), new.email);
  return new;
end;
$$;


-- ===== 20261028000006_substituir_classificacao.sql =====
-- Substitui a classificação inteira de um escalão numa só transação (tudo ou nada).
-- "security invoker": corre com as permissões de quem chama, por isso o RLS continua a aplicar-se.
create function public.substituir_classificacao(p_escalao uuid, p_linhas jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not public.pode_editar_escalao(p_escalao) then
    raise exception 'Sem permissão para este escalão' using errcode = '42501';
  end if;
  if jsonb_typeof(p_linhas) <> 'array' or jsonb_array_length(p_linhas) > 40 then
    raise exception 'Lista de linhas inválida' using errcode = '22023';
  end if;

  delete from public.classificacoes where escalao_id = p_escalao;

  insert into public.classificacoes
    (escalao_id, posicao, equipa, e_o_clube, jogos, vitorias, empates, derrotas, golos_marcados, golos_sofridos, pontos)
  select
    p_escalao,
    (l ->> 'posicao')::smallint,
    btrim(l ->> 'equipa'),
    coalesce((l ->> 'e_o_clube')::boolean, false),
    (l ->> 'jogos')::smallint,
    (l ->> 'vitorias')::smallint,
    (l ->> 'empates')::smallint,
    (l ->> 'derrotas')::smallint,
    (l ->> 'golos_marcados')::smallint,
    (l ->> 'golos_sofridos')::smallint,
    (l ->> 'pontos')::smallint
  from jsonb_array_elements(p_linhas) as l;
end;
$$;

revoke execute on function public.substituir_classificacao(uuid, jsonb) from public, anon;
grant execute on function public.substituir_classificacao(uuid, jsonb) to authenticated;


-- ===== 20261029000007_fiaes_e_golos.sql =====
-- =========================================================
-- Fiães Sport Clube: identidade por omissão + marcadores dos golos
-- =========================================================

-- Cores oficiais (verde e amarelo) como valores por omissão e linha de configuração do clube.
alter table public.clube_config alter column cor_primaria set default '#0B6B35';
alter table public.clube_config alter column cor_destaque set default '#FFD100';

insert into public.clube_config (nome, nome_curto, cor_primaria, cor_secundaria, cor_destaque, hashtag)
values ('Fiães Sport Clube', 'Fiães SC', '#0B6B35', '#FFFFFF', '#FFD100', '#FiaesSC')
on conflict (id) do nothing;

-- ---------------------------------------------------------
-- Nome curto dos marcadores: "João Pedro Silva" → "João S."
-- Muitos atletas são menores: o nome completo nunca chega a ser guardado.
-- ---------------------------------------------------------
create function public.abreviar_nome(nome text) returns text
language sql immutable set search_path = '' as $$
  with partes as (
    select regexp_split_to_array(btrim(regexp_replace(coalesce(nome, ''), '\s+', ' ', 'g')), ' ') as p
  )
  select case
    when cardinality(p) = 0 or p[1] = '' then ''
    when cardinality(p) = 1 then p[1]
    -- Já está abreviado ("João S.") ou é um "nome" especial como "Autogolo": fica igual.
    when cardinality(p) = 2 and p[2] ~ '^[[:alpha:]]\.$' then p[1] || ' ' || upper(p[2])
    else p[1] || ' ' || upper(left(p[cardinality(p)], 1)) || '.'
  end
  from partes;
$$;

create table public.golos (
  id         uuid primary key default gen_random_uuid(),
  jogo_id    uuid not null references public.jogos(id) on delete cascade,
  marcador   text not null check (char_length(marcador) between 1 and 40),
  minuto     smallint check (minuto between 1 and 130),
  penalti    boolean not null default false,
  criado_em  timestamptz not null default now()
);
create index golos_jogo_idx on public.golos (jogo_id);

create function public.golos_antes_de_gravar() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.marcador := public.abreviar_nome(new.marcador);
  if new.marcador = '' then
    raise exception 'Indica o nome do marcador' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger golos_antes_de_gravar
  before insert or update on public.golos
  for each row execute function public.golos_antes_de_gravar();

-- Quem pode editar um jogo (pelo escalão do jogo).
create function public.pode_editar_jogo(j uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.jogos where id = j and public.pode_editar_escalao(escalao_id));
$$;

alter table public.golos enable row level security;
create policy "leitura publica" on public.golos for select using (true);
create policy "criar golos" on public.golos for insert to authenticated with check (public.pode_editar_jogo(jogo_id));
create policy "editar golos" on public.golos for update to authenticated
  using (public.pode_editar_jogo(jogo_id)) with check (public.pode_editar_jogo(jogo_id));
create policy "apagar golos" on public.golos for delete to authenticated using (public.pode_editar_jogo(jogo_id));

revoke all on public.golos from anon, authenticated;
grant select on public.golos to anon;
grant select, insert, update, delete on public.golos to authenticated;

-- O público vê os marcadores a aparecer em tempo real.
alter publication supabase_realtime add table public.golos;

-- ===== 20261102000008_expulsoes.sql =====
-- =========================================================
-- Expulsões (cartões vermelhos) durante o jogo
-- =========================================================
-- Do lado do Fiães SC pode indicar-se o atleta (guardado sempre na forma curta, "João S.",
-- porque muitos atletas são menores). Do adversário regista-se só que houve expulsão.

create table public.expulsoes (
  id         uuid primary key default gen_random_uuid(),
  jogo_id    uuid not null references public.jogos(id) on delete cascade,
  lado       text not null check (lado in ('clube', 'adversario')),
  atleta     text check (atleta is null or char_length(atleta) between 1 and 40),
  minuto     smallint check (minuto between 1 and 130),
  criado_em  timestamptz not null default now()
);
create index expulsoes_jogo_idx on public.expulsoes (jogo_id);

create function public.expulsoes_antes_de_gravar() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.atleta := nullif(public.abreviar_nome(new.atleta), '');
  return new;
end;
$$;

create trigger expulsoes_antes_de_gravar
  before insert or update on public.expulsoes
  for each row execute function public.expulsoes_antes_de_gravar();

alter table public.expulsoes enable row level security;
create policy "leitura publica" on public.expulsoes for select using (true);
create policy "criar expulsoes" on public.expulsoes for insert to authenticated with check (public.pode_editar_jogo(jogo_id));
create policy "editar expulsoes" on public.expulsoes for update to authenticated
  using (public.pode_editar_jogo(jogo_id)) with check (public.pode_editar_jogo(jogo_id));
create policy "apagar expulsoes" on public.expulsoes for delete to authenticated using (public.pode_editar_jogo(jogo_id));

revoke all on public.expulsoes from anon, authenticated;
grant select on public.expulsoes to anon;
grant select, insert, update, delete on public.expulsoes to authenticated;

-- O público vê as expulsões a aparecer em tempo real.
alter publication supabase_realtime add table public.expulsoes;

-- ===== 20261102000009_restringir_funcoes.sql =====
-- =========================================================
-- Segurança (Security Advisor do Supabase): quem pode chamar as funções internas
-- =========================================================
-- As funções que verificam permissões são usadas pelas regras de acesso (RLS) do staff.
-- Quem não tem sessão não precisa delas: as regras públicas são só "leitura para todos".
revoke execute on function public.is_admin_ativo() from public, anon;
revoke execute on function public.is_super_admin() from public, anon;
revoke execute on function public.pode_editar_escalao(uuid) from public, anon;
revoke execute on function public.pode_editar_jogo(uuid) from public, anon;
grant execute on function public.is_admin_ativo() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.pode_editar_escalao(uuid) to authenticated;
grant execute on function public.pode_editar_jogo(uuid) to authenticated;

-- Função do trigger que cria o perfil quando alguém é convidado: corre sozinha, ninguém a chama.
revoke execute on function public.criar_perfil_novo_utilizador() from public, anon, authenticated;

-- ===== 20261102000010_adeptos.sql =====
-- =========================================================
-- Contas de adeptos/sócios (separadas do staff)
-- =========================================================
-- Qualquer pessoa pode criar conta de adepto (registo com email e palavra-passe).
-- Um adepto NÃO é staff: não tem perfil em public.perfis e não altera nada na app.
-- Só quem é CONVIDADO pelo clube (auth.users.invited_at preenchido) recebe perfil de staff.

create table public.adeptos (
  id            uuid primary key references auth.users(id) on delete cascade,
  nome          text not null check (char_length(nome) between 1 and 80),
  numero_socio  text check (numero_socio is null or char_length(numero_socio) between 1 and 20),
  -- Escalões que segue ("Os meus escalões"), pelo endereço (slug) de cada escalão.
  escaloes      text[] not null default '{}' check (cardinality(escaloes) <= 30),
  criado_em     timestamptz not null default now()
);

alter table public.adeptos enable row level security;
-- Cada adepto vê e altera só a sua conta; o super-admin vê todas (para ajudar sócios).
create policy "ver a sua conta" on public.adeptos for select to authenticated
  using (id = auth.uid() or public.is_super_admin());
create policy "alterar a sua conta" on public.adeptos for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

revoke all on public.adeptos from anon, authenticated;
grant select, update (nome, numero_socio, escaloes) on public.adeptos to authenticated;

-- ---------------------------------------------------------
-- Novo utilizador: staff (convidado) ou adepto (registo)
-- ---------------------------------------------------------
create or replace function public.criar_perfil_novo_utilizador() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  nome_ text := left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1), 'Sem nome'), 80);
begin
  if new.invited_at is not null then
    insert into public.perfis (id, nome, email)
    values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''), new.email, 'Sem nome'), new.email)
    on conflict (id) do nothing;
  else
    insert into public.adeptos (id, nome) values (new.id, nome_) on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

-- O Supabase pode marcar o convite (invited_at) logo a seguir a criar o utilizador:
-- nesse momento passa de adepto a staff.
create function public.promover_convidado() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''), new.email, 'Sem nome'), new.email)
  on conflict (id) do nothing;
  delete from public.adeptos where id = new.id;
  return new;
end;
$$;

create trigger promover_convidado
  after update of invited_at on auth.users
  for each row when (old.invited_at is null and new.invited_at is not null)
  execute function public.promover_convidado();

revoke execute on function public.criar_perfil_novo_utilizador() from public, anon, authenticated;
revoke execute on function public.promover_convidado() from public, anon, authenticated;

-- ===== Registo das migrações (para a CLI do Supabase saber o que já está aplicado) =====
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261028000001', 'esquema', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261028000002', 'rls', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261028000003', 'realtime', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261028000004', 'permissoes', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261028000005', 'perfis_email', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261028000006', 'substituir_classificacao', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261029000007', 'fiaes_e_golos', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261102000008', 'expulsoes', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261102000009', 'restringir_funcoes', '{}') on conflict (version) do nothing;
insert into supabase_migrations.schema_migrations (version, name, statements) values ('20261102000010', 'adeptos', '{}') on conflict (version) do nothing;
notify pgrst, 'reload schema';
