-- Fix perfis table: remove broken FK constraint and insert Gabriel Couto admin user
-- The original FK constraint was pointing to a non-existent or inaccessible users table
-- We need to allow perfis to be created without that constraint

-- Drop the broken foreign key constraint
ALTER TABLE public.perfis DROP CONSTRAINT IF EXISTS perfis_id_fkey;

-- Insert Gabriel Couto as super_admin if not already present
INSERT INTO public.perfis (id, nome, email, papel, ativo)
VALUES ('edb7bff1-e952-446e-877b-49e7c21cc582'::uuid, 'Gabriel Couto', 'gabrielcoutoassuncao@gmail.com', 'super_admin', true)
ON CONFLICT (id) DO UPDATE
SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  papel = EXCLUDED.papel,
  ativo = EXCLUDED.ativo;
