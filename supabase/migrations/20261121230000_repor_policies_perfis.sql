-- =========================================================
-- Repor as regras de acesso originais de public.perfis (20261028000002_rls.sql)
-- =========================================================
-- Em 21/11/2026, ao tentar resolver o "SEM ACESSO", foram apagadas à mão as policies do super-admin
-- ("gerir perfis" e o "ver perfil" com is_super_admin()). A causa real era outra (chave errada no env.ts).
-- Sem estas regras o super-admin só via o próprio perfil: a lista de Utilizadores ficava vazia
-- e não era possível editar o staff.
-- is_super_admin() é security definer, por isso não há recursão nas policies.

drop policy if exists "ver perfil" on public.perfis;
drop policy if exists "gerir perfis" on public.perfis;
drop policy if exists "super_admin_ler_tudo" on public.perfis;

create policy "ver perfil" on public.perfis for select to authenticated
  using (id = auth.uid() or public.is_super_admin());
create policy "gerir perfis" on public.perfis for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());
