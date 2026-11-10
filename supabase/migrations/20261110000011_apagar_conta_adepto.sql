-- =========================================================
-- RGPD: o adepto pode apagar a sua própria conta
-- =========================================================
-- Apaga o utilizador em auth.users (o login); a linha em public.adeptos vai em cascata.
-- Só funciona para contas de ADEPTO e só para a conta de quem está com sessão:
-- o staff não se apaga por engano (isso fica a cargo do super-admin).

create function public.apagar_minha_conta() returns void
language plpgsql security definer set search_path = '' as $$
declare
  eu uuid := auth.uid();
begin
  if eu is null then
    raise exception 'Sem sessão' using errcode = '42501';
  end if;
  if exists (select 1 from public.perfis where id = eu) then
    raise exception 'As contas do staff não se apagam aqui' using errcode = '42501';
  end if;
  if not exists (select 1 from public.adeptos where id = eu) then
    raise exception 'Conta de adepto não encontrada' using errcode = 'P0002';
  end if;
  delete from auth.users where id = eu;
end;
$$;

revoke execute on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;
