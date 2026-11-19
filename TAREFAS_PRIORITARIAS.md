# ⚡ TAREFAS PRIORITÁRIAS - APP FIÃES SC

## 🔴 CRÍTICAS (Implementar JÁ antes de publicar)

### 1. POLÍTICA DE PRIVACIDADE
**Tempo:** 2-3 horas  
**Risco:** 🔴 LGPD/GDPR multas até €20M

```markdown
Deve incluir:
- Dados coletados (nomes, emails)
- Como são processados (Supabase)
- Retenção de dados (X dias)
- Direitos do utilizador (acesso, correção, eliminação)
- Contacto do responsável (email)
- Cookies (mesmo que nenhum, declarar)
- Conformidade com LGPD/GDPR
```

**Ficheiro:** `src/app/(site)/privacidade/page.tsx`

---

### 2. TERMOS DE SERVIÇO
**Tempo:** 2-3 horas  
**Risco:** 🔴 Responsabilidade legal indefinida

```markdown
Deve incluir:
- Aviso legal: "Resultados sem garantia"
- Uso aceitável (não para fins comerciais)
- Propriedade intelectual
- Limitação de responsabilidade
- Encerramento de conta
- Alteração de termos
```

**Ficheiro:** `src/app/(site)/termos/page.tsx`

---

### 3. CONSENTIMENTO PARENTAL (SE APLICÁVEL)
**Tempo:** 1 hora  
**Risco:** 🔴 LGPD - Recolher dados de menores sem consentimento

**Verificar:**
- [ ] Qual é a idade mínima dos utilizadores?
- [ ] Se U-18, adicionar checkbox: "Confirmo ter consentimento parental"
- [ ] Guardar data de consentimento na base de dados

---

### 4. VERIFICAÇÃO DE SEGURANÇA DA SENHA ADMIN
**Tempo:** 1 hora  
**Risco:** 🔴 Força bruta fácil

Implementar:
```typescript
// Validar password strength
const validarPassword = (pwd: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return regex.test(pwd);
};
// Mínimo: 12 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
```

---

## 🟠 ALTOS (Implementar na primeira semana)

### 5. AUTENTICAÇÃO 2FA
**Tempo:** 2-3 horas  
**Risco:** 🟠 Sem 2FA, conta admin vulnerável

Opções:
- [ ] TOTP (Google Authenticator, Authy)
- [ ] SMS (mais caro, menos seguro)
- [ ] Biometria (difícil em web)

**Recomendação:** TOTP com Supabase

---

### 6. RATE LIMITING
**Tempo:** 1 hora  
**Risco:** 🟠 Força bruta em login

Implementar:
```typescript
// Limitar a 5 tentativas por 15 minutos
// Por IP ou por email
const rateLimit = {
  loginAttempts: 5,
  timeWindowMinutes: 15,
  storageKey: `login_attempts_${email}`,
};
```

---

### 7. LOGS DE AUDITORIA
**Tempo:** 2-3 horas  
**Risco:** 🟠 Sem rastreabilidade de ações

Registar:
- Quem fez login
- Quando criou/editou torneio
- Quando registou resultado
- Quando deletou dados

**Tabela:** `audit_logs` (user_id, action, timestamp, details)

---

## 🟡 MÉDIOS (Implementar antes do mês 2)

### 8. BACKUP TESTADO
**Tempo:** 2 horas  
**Risco:** 🟡 Perda de dados

- [ ] Verificar se Supabase tem backup automático
- [ ] Testar restauração de backup
- [ ] Documentar procedimento

---

### 9. MONITORAMENTO & ALERTAS
**Tempo:** 2-3 horas  
**Risco:** 🟡 Downtime não detectado

Implementar:
- Sentry para erros
- Uptime monitoring
- Email alerts

---

### 10. RESPONSIVIDADE MOBILE
**Tempo:** 2-4 horas  
**Risco:** 🟡 Má experiência em mobile

Testar em:
- [ ] iPhone 12/13/14
- [ ] Android (Samsung S20+)
- [ ] Tablet (iPad)

---

## 🟢 BAIXOS (Nice-to-have)

### 11. FAVICON & BRANDING
**Tempo:** 1 hora

```html
<!-- public/favicon.ico -->
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

---

### 12. SEO BÁSICO
**Tempo:** 1 hora

```typescript
export const metadata = {
  title: "Fiães SC - Gestão de Torneios",
  description: "Plataforma de gestão de torneios de futebol",
  openGraph: {
    title: "Fiães SC",
    description: "Gestão de torneios",
    url: "https://fiaes.pt",
  },
};
```

---

### 13. EMAIL DE CONTATO & SUPORTE
**Tempo:** 1-2 horas

Adicionar página `/contacto` com:
- Form de contacto
- Email para reportar bugs
- FAQ

---

## 📅 PLANO DE IMPLEMENTAÇÃO

### Semana 1 (Críticos)
```
Dia 1: Política Privacidade + Termos
Dia 2: Verificação password + Consentimento parental
Dia 3: Testing + ajustes
```

### Semana 2 (Altos)
```
Dia 4-5: 2FA + Rate Limiting
Dia 6: Logs auditoria
Dia 7: Testing completo
```

### Semana 3+ (Médios)
```
Semana 3: Backup + Monitoramento
Semana 4: Responsividade + SEO
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1 ✋ BLOCKER
- [ ] Política de Privacidade (texto + página)
- [ ] Termos de Serviço (texto + página)
- [ ] Consentimento parental (se menores)
- [ ] Validação password admin

### Semana 2 🔐 SEGURANÇA
- [ ] 2FA implementado
- [ ] Rate limiting implementado
- [ ] Logs de auditoria implementados

### Semana 3 📊 OPERAÇÕES
- [ ] Backup testado
- [ ] Monitoramento configurado
- [ ] Alertas de erro funcionando

### Semana 4 🎯 POLISH
- [ ] Mobile responsivo testado
- [ ] SEO básico implementado
- [ ] Favicon adicionado

---

## 💰 ESTIMATIVA DE TEMPO

| Tarefa | Tempo | Prioridade |
|---|---|---|
| Política Privacidade | 3h | 🔴 |
| Termos Serviço | 3h | 🔴 |
| 2FA | 3h | 🟠 |
| Rate Limiting | 1h | 🟠 |
| Logs Auditoria | 3h | 🟠 |
| Consentimento Parental | 1h | 🔴 |
| Validação Password | 1h | 🔴 |
| Backup Testado | 2h | 🟡 |
| Monitoramento | 3h | 🟡 |
| Mobile Responsivo | 3h | 🟡 |
| SEO Básico | 1h | 🟢 |
| Favicon | 1h | 🟢 |
| **TOTAL** | **~25h** | |

---

## 🎯 VERSÃO DE PUBLICAÇÃO RECOMENDADA

```
Depois de Semana 1: 0.1.0 (Beta com documentação legal)
Depois de Semana 2: 0.2.0 (Beta com segurança)
Depois de Semana 3: 1.0.0 (Estável com monitoramento)
```

---

## 📧 CONTACTO & SUPORTE

**Adicionar na aplicação:**
```
Contato: admin@fiaes.pt
Reportar bug: bugs@fiaes.pt
Privacidade: privacidade@fiaes.pt
```

---

**Documento gerado:** 2026-11-19  
**Próxima revisão:** Após implementação da Semana 1
