-- Habilitar RLS
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Apagar policies antigas
DROP POLICY IF EXISTS "PERMISSIVE ALL" ON public.perfis;
DROP POLICY IF EXISTS "ver perfil" ON public.perfis;

-- Criar policy correta
CREATE POLICY "ver perfil" ON public.perfis
FOR SELECT TO authenticated
USING (id::text = auth.uid()::text);
