# Deployment Guide - Fiães SC

## Pré-requisitos

- Node.js 18+
- Supabase project (database, auth)
- Vercel account ou outro hosting (Netlify, AWS, Digital Ocean)
- SendGrid account (para emails)
- Google Cloud e Azure accounts (para OAuth)

## 1. Preparação de Ambiente

### 1.1 Variables de Ambiente

Criar `.env.production`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Encriptação
ENCRYPTION_KEY=<64 caracteres hex> # Gerar com: node -e "require('./src/lib/encryption').generateEncryptionKey()"

# Email
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@fiaes.pt

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
MICROSOFT_TENANT_ID=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# URLs
NEXT_PUBLIC_APP_URL=https://fiaes.pt
```

### 1.2 Database Migrations

Executar todas as migrations:

```bash
# Listar migrations
ls migrations/

# Aplicar manualmente no Supabase SQL Editor:
# 1. rate_limits.sql
# 2. audit_logs.sql
# 3. two_factor.sql
```

Ou usar Supabase CLI:

```bash
npx supabase migration up
```

### 1.3 Configuração Supabase

#### RLS (Row Level Security)

Verificar que RLS está ativado em:
- audit_logs
- two_factor_secrets
- backup_codes

#### Auth Providers

Configurar em Supabase Dashboard:
- Google OAuth
- Microsoft Entra OAuth
- Email confirmação

## 2. Deployment

### Opção A: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variáveis de ambiente
# Vercel Dashboard > Project Settings > Environment Variables
# Adicionar todas as variáveis de .env.production

# 5. Verificar deployment
vercel list
```

### Opção B: AWS Amplify

```bash
# 1. Instalar Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configurar
amplify configure

# 3. Deploy
amplify publish
```

### Opção C: Docker (Auto-hospedagem)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
docker build -t fiaes-sc .
docker run -p 3000:80 fiaes-sc
```

## 3. Pós-Deployment

### 3.1 Verificação de Saúde

```bash
# Verificar health endpoint
curl https://fiaes.pt/api/health

# Esperado:
# {
#   "status": "healthy",
#   "timestamp": "2026-11-19T...",
#   "services": {
#     "database": "ok",
#     "auth": "ok"
#   },
#   "version": "0.2.0"
# }
```

### 3.2 SSL/TLS

Verificar HTTPS:
- Certificado válido
- HSTS headers
- Redirect HTTP → HTTPS

```bash
# Testar HTTPS
curl -I https://fiaes.pt/admin/login
```

### 3.3 Backups

Configurar backups automáticos:

1. Supabase > Database > Backups
   - Enable: ON
   - Retention: 7 dias
   - Frequency: Daily

2. Backup externo (recomendado):
   ```bash
   # Daily backup to S3
   pg_dump -h db.xxx.supabase.co \
     -U postgres \
     -d postgres \
     -Fc -v \
     --no-owner \
     > backup_$(date +%Y%m%d).sql
   
   # Upload to S3
   aws s3 cp backup_*.sql s3://my-bucket/backups/
   ```

## 4. Monitorização

### 4.1 Uptime Monitoring

Usar serviço como:
- Uptime Robot
- Datadog
- New Relic

```bash
# Exemplo com Uptime Robot
curl -X POST https://api.uptimerobot.com/v2/monitorAdd \
  -d "friendly_name=Fiães%20SC%20Health" \
  -d "type=1" \
  -d "url=https://fiaes.pt/api/health" \
  -d "interval=300" \
  -d "api_key=YOUR_API_KEY"
```

### 4.2 Error Tracking

Usar Sentry:

```bash
npm install @sentry/nextjs

# Configurar em next.config.js
```

### 4.3 Logs

Supabase fornece logs automáticos:
- Database logs
- Auth logs
- API logs

Aceder em: Supabase Dashboard > Logs

## 5. Security Checklist

- [ ] HTTPS activado e forçado
- [ ] HSTS headers configurados
- [ ] CSP headers validados
- [ ] CORS configurado (origens específicas)
- [ ] Rate limiting testado
- [ ] 2FA funcionando
- [ ] OAuth providers configurados
- [ ] Backups automáticos ativados
- [ ] Email service funcionando
- [ ] Encryption key configurada
- [ ] Database RLS ativado
- [ ] Audit logs registando

## 6. Performance Optimization

### 6.1 Caching

```bash
# Cache headers
Cache-Control: public, max-age=3600 # 1 hora
Cache-Control: private, max-age=0, must-revalidate # Sem cache
```

### 6.2 CDN

Vercel fornece CDN automático. Para outros:
- Cloudflare
- AWS CloudFront
- Fastly

### 6.3 Database Optimization

```sql
-- Índices importantes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_two_factor_user_id ON two_factor_secrets(user_id);
CREATE INDEX idx_backup_codes_used ON backup_codes(used);
```

## 7. Rollback Plan

Se houver problemas:

```bash
# 1. Voltar a versão anterior
vercel rollback

# 2. Ou redeploy da versão anterior
vercel deploy --prod --git-commit abc123
```

## 8. Scaling

Quando crescer:

- **Database**: Upgrade Supabase tier
- **Storage**: S3/GCS para ficheiros
- **Cache**: Redis para sessions
- **Email**: SendGrid tier adequado
- **Monitorização**: Upgrade Sentry/Datadog

## Contactos de Suporte

- **Supabase**: support@supabase.io
- **Vercel**: support@vercel.com
- **SendGrid**: support@sendgrid.com
- **Interno**: admin@fiaes.pt
