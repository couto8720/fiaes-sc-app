-- =========================================================
-- RGPD: prazos de conservação cumpridos automaticamente
-- =========================================================
-- As funções de limpeza já existiam (20261121210000) mas nada as corria.
-- pg_cron corre-as todas as noites (hora do servidor, UTC):
--   - audit_logs: apaga registos com mais de 90 dias (prazo da política de privacidade);
--   - rate_limits: apaga contadores de tentativas de login já expirados.

create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'limpar-auditoria-90-dias') then
    perform cron.unschedule('limpar-auditoria-90-dias');
  end if;
  if exists (select 1 from cron.job where jobname = 'limpar-tentativas-login') then
    perform cron.unschedule('limpar-tentativas-login');
  end if;
end;
$$;

select cron.schedule('limpar-auditoria-90-dias', '15 3 * * *', 'select public.cleanup_old_audit_logs()');
select cron.schedule('limpar-tentativas-login', '20 3 * * *', 'select public.cleanup_expired_rate_limits()');
