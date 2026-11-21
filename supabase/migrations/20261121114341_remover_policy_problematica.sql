-- Remover a policy problemática que bloqueia tudo
DROP POLICY IF EXISTS "gerir perfis" ON public.perfis;
