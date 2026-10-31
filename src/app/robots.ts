import type { MetadataRoute } from "next";

// O site público pode aparecer nos motores de busca; o painel e as rotas internas não.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/api", "/offline"] },
  };
}
