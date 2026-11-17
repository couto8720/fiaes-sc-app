import type { MetadataRoute } from "next";
import { obterConfig } from "@/lib/dados";

// Torna a app instalável ("Adicionar ao ecrã principal"), com o nome e as cores do clube.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const config = await obterConfig();
  return {
    name: config.nome,
    short_name: config.nome_curto,
    description: `Calendário, resultados em direto e classificações do ${config.nome_curto}.`,
    lang: "pt-PT",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: config.cor_primaria,
    theme_color: config.cor_primaria,
    categories: ["sports"],
    icons: [
      { src: "/icones/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Calendário", url: "/calendario" },
      { name: "Resultados", url: "/resultados" },
      { name: "Classificação", url: "/classificacao" },
    ],
  };
}
