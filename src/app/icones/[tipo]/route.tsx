import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { obterConfig } from "@/lib/dados";
import { simboloParaImagem } from "@/lib/simbolo";

// Ícones da app (ecrã principal, separador do browser) com o símbolo do clube.
// - "192", "512", "favicon": só o escudo, sem fundo (fica bem em qualquer fundo).
// - "maskable" (Android recorta em círculo/quadrado) e "apple" (iPhone não aceita transparência):
//   escudo sobre a cor principal, dentro da zona segura.
const TIPOS = {
  "192": { tamanho: 192, escudo: 0.94, fundo: false },
  "512": { tamanho: 512, escudo: 0.94, fundo: false },
  "favicon": { tamanho: 48, escudo: 1, fundo: false },
  "maskable": { tamanho: 512, escudo: 0.62, fundo: true },
  "apple": { tamanho: 180, escudo: 0.78, fundo: true },
} as const;

const PROPORCAO = 425 / 512; // largura/altura do escudo

export async function GET(_: NextRequest, { params }: RouteContext<"/icones/[tipo]">) {
  const tipo = (await params).tipo as keyof typeof TIPOS;
  const t = TIPOS[tipo];
  if (!t) return new Response("Não encontrado", { status: 404 });

  const config = await obterConfig();
  const simbolo = await simboloParaImagem(config);
  const altura = Math.round(t.tamanho * t.escudo);
  const largura = Math.round(altura * PROPORCAO);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.fundo ? config.cor_primaria : "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- desenhado pelo Satori, não pelo browser */}
        <img src={simbolo} width={largura} height={altura} style={{ objectFit: "contain" }} alt="" />
      </div>
    ),
    {
      width: t.tamanho,
      height: t.tamanho,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
