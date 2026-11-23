import type { MetadataRoute } from "next";
import { APP_PRIVADA } from "@/lib/acesso";

// Com a app privada, nada aparece nos motores de busca. Aberta: o site público sim, o painel e as rotas internas não.
export default function robots(): MetadataRoute.Robots {
  if (APP_PRIVADA) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/offline"] },
  };
}
