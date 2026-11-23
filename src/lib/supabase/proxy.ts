import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigurado } from "./env";
import { APP_PRIVADA, caminhoLivre } from "../acesso";

// Com a app privada, o papel é lido com a chave secreta (como em lib/sessao.ts), pelo id já validado em getClaims().
const CHAVE_SECRETA = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function eSuperAdmin(userId: string) {
  if (!CHAVE_SECRETA) return false;
  const admin = createClient(SUPABASE_URL, CHAVE_SECRETA, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await admin.from("perfis").select("papel, ativo").eq("id", userId).maybeSingle();
  return Boolean(data?.ativo && data.papel === "super_admin");
}

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

  // App privada: tudo, exceto as páginas de entrada, exige sessão de super-admin.
  if (APP_PRIVADA && !caminhoLivre(pathname)) {
    const superAdmin = data?.claims?.sub ? await eSuperAdmin(data.claims.sub) : false;
    if (!superAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ erro: "A aplicação está privada." }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.search = "";
      if (autenticado) {
        url.pathname = "/admin/sem-acesso";
      } else {
        url.pathname = "/admin/login";
        if (pathname.startsWith("/admin")) url.searchParams.set("seguinte", pathname);
      }
      return NextResponse.redirect(url);
    }
  }

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
