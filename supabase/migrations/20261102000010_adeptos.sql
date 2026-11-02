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
