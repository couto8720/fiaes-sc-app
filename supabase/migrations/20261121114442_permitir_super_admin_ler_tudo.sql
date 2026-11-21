-- Permitir que super_admin leia todos os perfis
CREATE POLICY "super_admin_ler_tudo" ON public.perfis
FOR SELECT TO authenticated
USING (
  papel = 'super_admin'
  OR (id)::text = (auth.uid())::text
);
