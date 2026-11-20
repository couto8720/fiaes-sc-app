import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  // As fontes da imagem do post são lidas do disco: garante que vão com a função no deploy.
  outputFileTracingIncludes: {
    "/admin/post/imagem": ["./assets/fontes/*.woff", "./public/simbolo-fiaes.png"], // Barlow + Teko
    "/icones/[tipo]": ["./public/simbolo-fiaes.png"],
  },
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Cabeçalhos de segurança em todas as páginas.
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // O service worker nunca fica em cache, para as atualizações chegarem logo.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
