-- Atualizar admin Gabriel
UPDATE public.perfis
SET
  papel = 'super_admin',
  ativo = true
WHERE id = 'edb7bf11-e952-446e-877b-49e7c21cc582'::uuid;
