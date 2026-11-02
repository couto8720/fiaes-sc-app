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
