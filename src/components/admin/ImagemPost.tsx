// Desenho da imagem do post (renderizado pelo Satori/ImageResponse, não pelo browser):
// só flexbox e estilos inline; cada <div> com vários filhos precisa de display: flex.
import type { ClubeConfig } from "@/lib/supabase/database.types";
import { formatarIntervalo } from "@/lib/datas";
import type { Formato, ItemPost } from "@/lib/post";

const COR_DESFECHO = { vitoria: "#22c55e", empate: "#eab308", derrota: "#ef4444" } as const;
const LETRA_DESFECHO = { vitoria: "V", empate: "E", derrota: "D" } as const;

/** Escurece uma cor hexadecimal (para o degradê do fundo). */
function escurecer(hex: string, fator: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((x) => Math.round(x * fator));
  return `rgb(${c.join(",")})`;
}

type Props = {
  config: ClubeConfig;
  itens: ItemPost[];
  de: string;
  ate: string;
  formato: Formato;
  pagina: number;
  totalPaginas: number;
  /** Símbolo do clube: URL absoluto ou data URI (ver lib/simbolo.ts). */
  simbolo: string;
};

export function ImagemPost({ config, itens, de, ate, formato, pagina, totalPaginas, simbolo }: Props) {
  const texto = config.cor_secundaria;
  const destaque = config.cor_destaque;
  const story = formato === "story";
  const alturaLinha = story ? 118 : 112;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `linear-gradient(160deg, ${config.cor_primaria} 0%, ${escurecer(config.cor_primaria, 0.45)} 100%)`,
        color: texto,
        fontFamily: "Barlow",
        padding: story ? "120px 60px 100px" : "64px 60px 52px",
      }}
    >
      {/* Cabeçalho: título à esquerda, símbolo do clube à direita */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", opacity: 0.9 }}>{config.nome_curto}</div>
          <div style={{ fontSize: story ? 150 : 128, fontWeight: 800, lineHeight: 0.9, textTransform: "uppercase", marginTop: story ? 28 : 16 }}>Resultados</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, fontSize: 40, fontWeight: 600, textTransform: "uppercase" }}>
            <div style={{ width: 56, height: 8, background: destaque }} />
            <div style={{ color: destaque }}>{`Fim de semana · ${formatarIntervalo(de, ate)}`}</div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem desenhada pelo Satori, não pelo browser */}
        <img src={simbolo} width={story ? 208 : 174} height={story ? 250 : 210} style={{ objectFit: "contain" }} alt="" />
      </div>

      {/* Jogos */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, margin: story ? "48px 0" : "28px 0", flexGrow: 1 }}>
        {itens.length === 0 && (
          <div style={{ display: "flex", fontSize: 48, fontWeight: 600, opacity: 0.85, marginTop: 40 }}>Sem jogos neste fim de semana.</div>
        )}
        {itens.map((i) => (
          <div
            key={i.id}
            style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: alturaLinha, background: "rgba(255,255,255,0.09)", borderRadius: 22, padding: i.marcadores ? "16px 22px 14px" : "0 22px" }}
          >
          <div style={{ display: "flex", alignItems: "center", gap: 18, height: i.marcadores ? 76 : alturaLinha }}>
            <div
              style={{
                width: 150, height: 60, borderRadius: 14, background: destaque, color: config.cor_primaria,
                display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 8px",
                // Nomes compridos ("Feminino Sub-13") em duas linhas, com letra menor.
                fontSize: i.escalao.length > 11 ? 22 : i.escalao.length > 8 ? 27 : 32,
                lineHeight: i.escalao.length > 11 ? 1.05 : 1,
                fontWeight: 800, textTransform: "uppercase", flexShrink: 0,
              }}
            >
              {i.escalao}
            </div>
            <Equipa nome={i.casa.nome} clube={i.casa.eClube} destaque={destaque} alinhar="flex-end" />
            <div style={{ width: 150, display: "flex", justifyContent: "center", fontSize: i.nota ? 34 : 62, fontWeight: 800, flexShrink: 0, textTransform: "uppercase", opacity: i.nota ? 0.8 : 1 }}>
              {i.nota ?? `${i.casa.golos} - ${i.fora.golos}`}
            </div>
            <Equipa nome={i.fora.nome} clube={i.fora.eClube} destaque={destaque} alinhar="flex-start" />
            <div
              style={{
                width: 52, height: 52, borderRadius: 26, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, fontWeight: 800, color: "#fff",
                background: i.desfecho ? COR_DESFECHO[i.desfecho] : "rgba(255,255,255,0.15)",
              }}
            >
              {i.desfecho ? LETRA_DESFECHO[i.desfecho] : "–"}
            </div>
          </div>
          {i.marcadores && (
            // Marcadores do clube (nome curto), alinhados com os nomes das equipas.
            <div style={{ display: "block", paddingLeft: 168, fontSize: 26, fontWeight: 600, color: destaque, lineClamp: 1, overflow: "hidden" }}>
              {`GOLOS: ${i.marcadores}`}
            </div>
          )}
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 34, fontWeight: 600, opacity: 0.9 }}>
        <div style={{ color: destaque }}>{config.hashtag ?? ""}</div>
        {totalPaginas > 1 && <div>{`${pagina}/${totalPaginas}`}</div>}
      </div>
    </div>
  );
}

function Equipa({ nome, clube, destaque, alinhar }: { nome: string; clube: boolean; destaque: string; alinhar: "flex-start" | "flex-end" }) {
  // Até 13 letras: letra grande; até 17: média, numa linha; mais compridos
  // ("Associação Desportiva e Recreativa de…"): letra menor e até duas linhas.
  const longo = nome.length > 17;
  return (
    <div style={{ display: "flex", flex: 1, justifyContent: alinhar, alignItems: "center", overflow: "hidden" }}>
      <div
        style={{
          display: "block",
          fontSize: longo ? 28 : nome.length > 13 ? 31 : 38,
          lineHeight: longo ? 1.05 : 1.1,
          fontWeight: clube ? 800 : 600,
          color: clube ? destaque : undefined,
          textTransform: "uppercase",
          lineClamp: longo ? 2 : 1,
          overflow: "hidden",
          textAlign: alinhar === "flex-end" ? "right" : "left",
        }}
      >
        {nome}
      </div>
    </div>
  );
}
