-- Corre UMA vez, no SQL Editor do Supabase, depois de criares o teu utilizador
-- em Authentication → Users → "Add user" (ou "Invite").
-- Troca o email pelo teu.

update public.perfis
set papel = 'super_admin', ativo = true
where id = (select id from auth.users where email = 'o-teu-email@exemplo.pt');
