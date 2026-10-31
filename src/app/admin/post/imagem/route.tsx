import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { exigirSessao } from "@/lib/sessao";
import { modoDemo } from "@/lib/dados";
import { FORMATOS } from "@/lib/post";
import { conteudoPost, parametrosPost } from "@/lib/postDados";
import { ImagemPost } from "@/components/admin/ImagemPost";
import { simboloParaImagem } from "@/lib/simbolo";

// Fontes lidas uma vez (não dependem do pedido). Ficheiros em assets/fontes (licença OFL).
const pasta = join(process.cwd(), "assets", "fontes");
// Teko (títulos, resultados, etiquetas) + Barlow Condensed (nomes das equipas).
const fontes = Promise.all([
  readFile(join(pasta, "barlow-condensed-latin-600-normal.woff")),
  readFile(join(pasta, "barlow-condensed-latin-800-normal.woff")),
  readFile(join(pasta, "teko-latin-500-normal.woff")),
  readFile(join(pasta, "teko-latin-700-normal.woff")),
]);

/**
 * GET /admin/post/imagem?de=2026-10-24&ate=2026-10-25&formato=feed|story&pagina=1[&download=1]
 * PNG com os resultados do fim de semana. Só para staff com sessão (no modo demonstração, aberto).
 */
export async function GET(request: NextRequest) {
  if (!modoDemo) await exigirSessao();

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const { de, ate, formato } = await parametrosPost(params);
  const { config, paginas } = await conteudoPost(de, ate, formato);
  const pagina = Math.min(Math.max(1, Number(params.pagina) || 1), paginas.length);
  const { largura, altura } = FORMATOS[formato];
  const [[f600, f800, teko500, teko700], simbolo] = await Promise.all([fontes, simboloParaImagem(config)]);

  const nome = `resultados-${de}${paginas.length > 1 ? `-${pagina}` : ""}${formato === "story" ? "-story" : ""}.png`;
  return new ImageResponse(
    <ImagemPost config={config} itens={paginas[pagina - 1]} de={de} ate={ate} formato={formato} pagina={pagina} totalPaginas={paginas.length} simbolo={simbolo} />,
    {
      width: largura,
      height: altura,
      fonts: [
        { name: "Barlow", data: f600, weight: 600, style: "normal" },
        { name: "Barlow", data: f800, weight: 800, style: "normal" },
        { name: "Teko", data: teko500, weight: 500, style: "normal" },
        { name: "Teko", data: teko700, weight: 700, style: "normal" },
      ],
      headers: {
        "Cache-Control": "private, no-store",
        ...(params.download ? { "Content-Disposition": `attachment; filename="${nome}"` } : {}),
      },
    },
  );
}
