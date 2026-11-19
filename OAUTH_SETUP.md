# OAuth Setup Guide - Fiães SC

## Overview

OAuth (Social Login) permite que utilizadores façam login com Google ou Microsoft. Melhora a segurança e a UX eliminando a necessidade de gerir passwords adicionais.

## Setup no Supabase

### 1. Google OAuth

#### Passo 1: Google Cloud Console

1. Aceder a https://console.cloud.google.com/
2. Criar novo projeto:
   - Nome: "Fiães SC"
   - Organização: (opcional)
3. Aguardar criação do projeto

#### Passo 2: Ativar Google+ API

1. No menu superior, procurar "APIs & Services"
2. Clicar "Enable APIs and Services"
3. Procurar "Google+ API"
4. Clicar em "Enable"

#### Passo 3: Criar Credenciais OAuth

1. Ir para "Credentials" (menu esquerdo)
2. Clicar "Create Credentials" > "OAuth client ID"
3. Se pedir, primeiro configurar "OAuth consent screen":
   - User Type: External
   - App name: "Fiães SC"
   - User support email: `admin@fiaes.pt`
   - Developer contact: `admin@fiaes.pt`
   - Scopes: `email`, `profile`
   - Salvar e continuar

4. Criar OAuth client ID:
   - Application type: Web application
   - Name: "Fiães SC Web"
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://[PROJECT_ID].supabase.co
     https://fiaes.pt
     https://www.fiaes.pt
     https://app.fiaes.pt
     ```
   - Authorized redirect URIs:
     ```
     https://[PROJECT_ID].supabase.co/auth/v1/callback?provider=google
     http://localhost:3000/auth/callback
     ```
   - Clicar "Create"

5. Copiar:
   - Client ID
   - Client Secret

#### Passo 4: Configurar no Supabase

1. Ir para Supabase Dashboard > Project Settings > Authentication > Providers
2. Procurar "Google"
3. Clicar para expandir
4. Toggle "Enabled" para ON
5. Colar:
   - Client ID (do Google Cloud)
   - Client Secret (do Google Cloud)
6. Clicar "Save"

### 2. Microsoft OAuth (Azure)

#### Passo 1: Azure Portal

1. Aceder a https://portal.azure.com/
2. Ir para "Azure Active Directory"
3. Ir para "App registrations"
4. Clicar "New registration"

#### Passo 2: Registar Aplicação

- Name: "Fiães SC"
- Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
- Redirect URI:
  - Platform: Web
  - URI: `https://[PROJECT_ID].supabase.co/auth/v1/callback?provider=azure`
- Clicar "Register"

#### Passo 3: Configurar Credenciais

1. No menu esquerdo, ir para "Certificates & secrets"
2. Clicar "New client secret"
3. Add a description: "Supabase Auth"
4. Selecionar expiry: 24 months
5. Clicar "Add"
6. **Copiar imediatamente o Value** (não fica visível depois!)

#### Passo 4: Obter IDs

1. Ir para "Overview"
2. Copiar:
   - Application (client) ID
   - Directory (tenant) ID (este vai no lugar de Client Secret)

#### Passo 5: Configurar no Supabase

1. Supabase Dashboard > Authentication > Providers
2. Procurar "Microsoft Entra"
3. Clicar para expandir
4. Toggle "Enabled" para ON
5. Preencher:
   - Tenant ID: Directory (tenant) ID do Azure
   - Client ID: Application (client) ID do Azure
   - Client Secret: Valor copiado do Azure
6. Clicar "Save"

## Testing

### Local (localhost:3000)

1. Abrir http://localhost:3000/admin/login
2. Clicar "Entrar com Google" ou "Entrar com Microsoft"
3. Fazer login na conta
4. Autorizar acesso quando pedido
5. Deverá fazer redirect e criar utilizador

### Produção (fiaes.pt)

Após deploy, testar novamente nos domínios de produção.

## Troubleshooting

### "Redirect URI mismatch"
- Verificar se o URI no OAuth config matches exatamente com o no Supabase
- Atender a http:// vs https://

### "Invalid client ID"
- Verificar se foi copiado corretamente (sem espaços)
- Verificar se client secret está correto

### "User account disabled"
- Utilizador pode estar desativado na organização Azure
- Verificar permissions no Azure

### Callback vazio
- Verificar se Supabase Auth > Providers está ativado
- Verificar se redirect URI no OAuth config aponta para o callback correto

## Fluxo de Login

1. Utilizador clica "Entrar com Google/Microsoft"
2. É redirecionado para Google/Microsoft login
3. Faz login e autoriza acesso
4. Retorna a `https://fiaes.pt/auth/callback`
5. Supabase cria ou faz login do utilizador
6. É redirecionado para `/admin` ou página original

## Dados Coletados

Via OAuth, coletamos:
- Email
- Nome
- Foto de perfil (opcional)

Estes dados estão protegidos pela Política de Privacidade.

## Security Notes

- Secrets são armazenados com encriptação no Supabase
- OAuth tokens expiro automaticamente
- 2FA continua a ser verificado após OAuth login
- Audit logs registam todas OAuth login attempts

## Referências

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Azure Documentation](https://learn.microsoft.com/en-us/azure/active-directory/)
- [Supabase OAuth Docs](https://supabase.com/docs/guides/auth/social-login)
