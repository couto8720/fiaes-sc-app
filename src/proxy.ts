import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Atualizar sessão Supabase
  let response = await atualizarSessao(request);

  // 1. HSTS (HTTP Strict-Transport-Security)
  // Obriga HTTPS em produção por 1 ano
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // 2. CSP (Content Security Policy)
  // Previne XSS e outras injeções
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://*.supabase.co; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
  );

  // 3. X-Content-Type-Options (evita MIME type sniffing)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // 4. X-Frame-Options (evita clickjacking)
  response.headers.set("X-Frame-Options", "DENY");

  // 5. X-XSS-Protection (proteção XSS legada)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // 6. Referrer-Policy (controla referrer info)
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 7. Permissions-Policy (antigas Feature-Policy)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), ambient-light-sensor=(), gyroscope=(), magnetometer=(), usb=()"
  );

  // 8. CORS (Cross-Origin Resource Sharing)
  // Apenas permite origens específicas
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3000",
    "https://fiaes.pt",
    "https://www.fiaes.pt",
    "https://app.fiaes.pt",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  return response;
}

export const config = {
  // Aplicar proxy a todas as rotas exceto assets estáticos
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icones|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
