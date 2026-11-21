-- Garantir que a conta Gabriel tem o nome preenchido
UPDATE public.perfis
SET nome = 'Gabriel Couto'
WHERE id = 'edb7bff1-e952-446e-877b-49e7c21cc582'::uuid AND (nome IS NULL OR nome = '');
