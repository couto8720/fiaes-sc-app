-- Permitir ao service_role ler todos os perfis (ignora RLS)
-- Adicionar policy para service_role
CREATE POLICY "service_role_lê_tudo" ON public.perfis
FOR SELECT TO service_role
USING (true);

-- Garantir que service_role pode atualizar perfis
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO service_role;
