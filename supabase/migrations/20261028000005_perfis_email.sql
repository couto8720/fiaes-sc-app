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
