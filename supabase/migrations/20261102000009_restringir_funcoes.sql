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
