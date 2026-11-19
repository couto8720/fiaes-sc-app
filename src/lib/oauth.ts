import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OAuthProvider } from "@/lib/oauth-config";

interface OAuthConfig {
  redirectUrl: string;
}

/**
 * Inicia login via OAuth
 * @param provider Provedor OAuth (google, microsoft)
 * @param redirectUrl URL para redirecionar após autenticação
 */
export async function signInWithOAuth(provider: OAuthProvider, redirectUrl: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        // Sugestão de acesso a email
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(`Erro ao iniciar login com ${provider}: ${error.message}`);
  }

  return data;
}

/**
 * Obtém URL de login OAuth
 */
export async function getOAuthUrl(provider: OAuthProvider, baseUrl: string): Promise<string | null> {
  try {
    const { data } = await signInWithOAuth(provider, `${baseUrl}/auth/callback`);
    return data?.url || null;
  } catch (error) {
    console.error("Erro ao gerar URL OAuth:", error);
    return null;
  }
}

/**
 * Configuração necessária no Supabase
 */
export const OAUTH_SETUP_INSTRUCTIONS = `
# Configuração de OAuth no Supabase

## Google OAuth

1. Aceder a https://console.cloud.google.com/
2. Criar novo projeto: "Fiães SC"
3. Ativar Google+ API
4. Criar credenciais OAuth 2.0:
   - Tipo: Web application
   - URIs de redireção autorizados:
     * https://[PROJECT_ID].supabase.co/auth/v1/callback?provider=google
   - Copiar Client ID e Client Secret

5. No Supabase Dashboard:
   - Authentication > Providers > Google
   - Ativar Google
   - Colar Client ID e Client Secret
   - Salvar

## Microsoft OAuth

1. Aceder a https://portal.azure.com/
2. Azure Active Directory > App registrations
3. Nova aplicação:
   - Nome: "Fiães SC"
   - Tipo de conta: Qualquer conta Microsoft
   - URI de redireção: https://[PROJECT_ID].supabase.co/auth/v1/callback?provider=azure

4. Certificados e segredos:
   - Novo segredo de cliente
   - Copiar Valor

5. No Supabase Dashboard:
   - Authentication > Providers > Microsoft Entra
   - Ativar
   - Colar Client ID e Client Secret
   - Salvar

## Verificação

Após configurar, testar:
- Aceder a /admin/login
- Clicar em "Entrar com Google" ou "Entrar com Microsoft"
- Autorizar acesso
- Verificar se login funciona
`;
