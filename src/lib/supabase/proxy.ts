import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigurado } from "./env";

// Renova a sessão (cookies) em cada pedido e faz a verificação otimista de /admin.
// A segurança real está no RLS da base de dados; isto só evita mostrar o painel a quem não tem sessão.
export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseConfigurado) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Não pôr código entre a criação do cliente e getClaims(): é o que renova o token.
  const { data } = await supabase.auth.getClaims();
  const autenticado = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const rotaAdmin = pathname.startsWith("/admin");
  const rotaPublica = pathname === "/admin/login" || pathname === "/admin/recuperar"; // /auth/* fica fora de /admin

  if (rotaAdmin && !rotaPublica && !autenticado) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("seguinte", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
