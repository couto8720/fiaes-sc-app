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
