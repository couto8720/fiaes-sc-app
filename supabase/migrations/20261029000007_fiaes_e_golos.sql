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
