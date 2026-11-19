# Verificação de Backups - Supabase

## Status Atual

**Supabase Project:** fiaes-sc-app  
**Data:** 2026-11-19  
**Status:** ✅ Backups automáticos ativados

## Configuração de Backups Automáticos

### 1. Supabase Dashboard
Aceder a: https://app.supabase.com > Project > Database > Backups

**Status:**
- ✅ Backups automáticos: ATIVADO
- ✅ Retenção: 7 dias (padrão Supabase)
- ✅ Frequência: Diário (00:00 UTC)

### 2. Backups Automáticos Supabase
Supabase armazena automaticamente:
- Snapshots diários do banco de dados
- Replicação em múltiplas regiões (DR)
- Retenção mínima: 7 dias
- Acesso: Dashboard > Backups

### 3. Backup Manual (Recomendado)

Para fazer backup manual:

```sql
-- Exportar estrutura e dados
pg_dump -h db.xxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -Fc -v \
  --no-owner \
  --no-privileges \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Procedimento de Restauração

### Via Supabase Dashboard
1. Aceder a Backups
2. Selecionar checkpoint desejado
3. Clicar "Restore" (cria nova instância ou restaura)

### Via psql (Restauração Manual)
```sql
pg_restore -h db.xxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -v \
  backup_20261119_000000.sql
```

## Checklist de Verificação

- [x] Backups automáticos ativados no Supabase
- [x] Retenção: 7 dias confirmada
- [x] Acesso a dashboard de backups verificado
- [x] Procedimento de restauração documentado
- [ ] Teste de restauração (fazer mensalmente)

## Recomendações

1. **Teste de Restauração:**
   - Executar backup restore test mensalmente
   - Verificar integridade dos dados após restauração

2. **Backup Externo:**
   - Considerar backup externo para compliance (GDPR)
   - Armazenar em S3/Google Cloud com encriptação

3. **Alertas:**
   - Configurar alerts para falhas de backup
   - Monitorizar espaço de armazenamento

4. **GDPR Compliance:**
   - Backups têm dados pessoais (audit logs, emails)
   - Implementar política de retenção (90 dias para audit logs)
   - Backups são encriptados em trânsito e em repouso

## Configuração Recomendada

Para aumentar segurança e conformidade:

1. **Backups Diários para Cloud:**
   ```
   - AWS S3 (server-side encryption)
   - Google Cloud Storage (Customer-managed encryption)
   - Retenção: 30 dias
   ```

2. **Monitorização:**
   - Alertas email para falhas
   - Dashboard para status de backups
   - Auditoria de acesso a backups

3. **Teste Mensal:**
   - Restaurar backup para ambiente de staging
   - Validar integridade (row count, checksums)
   - Documentar resultado
