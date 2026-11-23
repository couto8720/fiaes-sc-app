/**
 * App privada: enquanto estiver `true`, só o super-admin consegue usar a aplicação.
 * Toda a gente (visitantes, adeptos e restante staff) vê apenas a página de entrar.
 * Para voltar a abrir o site ao público, mudar para `false`.
 */
export const APP_PRIVADA = true;

/** Caminhos que continuam acessíveis com a app privada (entrar, recuperar acesso e manutenção). */
const LIVRES = [
  "/admin/login",
  "/admin/recuperar",
  "/admin/recuperar-2fa",
  "/admin/verificar-2fa",
  "/admin/definir-palavra-passe",
  "/admin/sem-acesso",
  "/auth/",
  "/api/manter-ativo",
  "/api/health",
  "/manifest.webmanifest",
  "/sw.js",
  "/robots.txt",
  "/offline",
  "/privacidade",
  "/termos",
];

export function caminhoLivre(pathname: string) {
  return LIVRES.some((c) => (c.endsWith("/") ? pathname.startsWith(c) : pathname === c || pathname.startsWith(`${c}/`)));
}
