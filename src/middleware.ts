import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Criar cliente Supabase
  let supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          let response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          return response;
        },
      },
    }
  );

  // Obter sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se está em /login e tem sessão, redireciona para /
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Se NÃO está em /login, /auth/*, ou rotas públicas e NÃO tem sessão, redireciona para /login
  const rotasPublicas = ["/login", "/auth", "/privacidade", "/termos", "/direitos"];
  const éRotaPublica = rotasPublicas.some((rota) => pathname.startsWith(rota));

  if (!éRotaPublica && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
