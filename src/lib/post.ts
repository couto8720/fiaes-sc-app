// Conteúdo do post de resultados (imagem + legenda). Funções puras, testadas em tests/post.test.ts.
import type { Jogo } from "./supabase/database.types";
import { desfecho, equipas, type Desfecho } from "./jogos.ts";
import { formatarIntervalo } from "./datas.ts";
import { resumoMarcadores, type Golo } from "./marcadores.ts";

export type JogoPost = Pick<Jogo, "id" | "em_casa" | "adversario" | "golos_clube" | "golos_adversario" | "estado" | "data_hora"> & {
  escalao: { nome: string; ordem: number } | null;
  golos?: Golo[];
};

export type ItemPost = {
  id: string;
  escalao: string;
  casa: { nome: string; golos: number | null; eClube: boolean };
  fora: { nome: string; golos: number | null; eClube: boolean };
  /** null = sem resultado (adiado/cancelado) */
  desfecho: Desfecho;
  nota: "Adiado" | "Cancelado" | null;
  /** "Tiago C. (2), Rui P." — vazio se não houver marcadores registados. */
  marcadores: string;
};

export const FORMATOS = {
  feed: { largura: 1080, altura: 1350, porPagina: 6 },
  story: { largura: 1080, altura: 1920, porPagina: 9 },
} as const;
export type Formato = keyof typeof FORMATOS;

/** Jogos que entram no post: terminados, adiados e cancelados, por ordem de escalão e de hora. */
export function itensPost(jogos: JogoPost[], nomeClube: string): ItemPost[] {
  return jogos
    .filter((j) => j.estado === "final" || j.estado === "adiado" || j.estado === "cancelado")
    .sort((a, b) => (a.escalao?.ordem ?? 99) - (b.escalao?.ordem ?? 99) || a.data_hora.localeCompare(b.data_hora))
    .map((j) => {
      const [casa, fora] = equipas(j, nomeClube);
      return {
        id: j.id,
        escalao: j.escalao?.nome ?? "",
        casa,
        fora,
        desfecho: desfecho(j),
        nota: j.estado === "adiado" ? "Adiado" : j.estado === "cancelado" ? "Cancelado" : null,
        marcadores: resumoMarcadores(j.golos ?? [], { minutos: false }),
      };
    });
}

export function paginar<T>(itens: T[], porPagina: number): T[][] {
  if (!itens.length) return [[]];
  const paginas: T[][] = [];
  for (let i = 0; i < itens.length; i += porPagina) paginas.push(itens.slice(i, i + porPagina));
  return paginas;
}

const EMOJI: Record<Exclude<Desfecho, null>, string> = { vitoria: "✅", empate: "🤝", derrota: "❌" };

/** Legenda pronta a colar no Instagram/Facebook. */
export function textoPost(itens: ItemPost[], o: { de: string; ate: string; hashtag: string | null }) {
  const cabecalho = `⚽ Resultados do fim de semana (${formatarIntervalo(o.de, o.ate)})`;
  if (!itens.length) return `${cabecalho}\n\nSem jogos neste fim de semana.`;

  const linhas = itens.map((i) => {
    if (i.nota) {
      const adversario = i.casa.eClube ? i.fora.nome : i.casa.nome;
      return `${i.escalao}: ${i.nota.toLowerCase()} (vs ${adversario})`;
    }
    const emoji = i.desfecho ? `${EMOJI[i.desfecho]} ` : "";
    const marcadores = i.marcadores ? ` (⚽ ${i.marcadores})` : "";
    return `${emoji}${i.escalao}: ${i.casa.nome} ${i.casa.golos}–${i.fora.golos} ${i.fora.nome}${marcadores}`;
  });

  const v = itens.filter((i) => i.desfecho === "vitoria").length;
  const e = itens.filter((i) => i.desfecho === "empate").length;
  const d = itens.filter((i) => i.desfecho === "derrota").length;
  const balanco = [v && `${v} ${v === 1 ? "vitória" : "vitórias"}`, e && `${e} ${e === 1 ? "empate" : "empates"}`, d && `${d} ${d === 1 ? "derrota" : "derrotas"}`]
    .filter(Boolean)
    .join(", ");

  return [cabecalho, "", ...linhas, "", balanco && `Balanço: ${balanco}.`, "Obrigado a todos pelo apoio! 💪", o.hashtag ?? ""]
    .filter((l, k, arr) => l !== "" || (arr[k - 1] !== "" && k < arr.length - 1))
    .join("\n")
    .trim();
}
