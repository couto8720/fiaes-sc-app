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
