-- Corrigir o ID do admin (a migração anterior tinha o ID errado)
UPDATE public.perfis
SET
  papel = 'super_admin',
  ativo = true
WHERE id = 'edb7bff1-e952-446e-877b-49e7c21cc582'::uuid;
