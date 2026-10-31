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
