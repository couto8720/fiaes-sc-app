// Lê uma tabela de classificação copiada de um site (associação, FPF…) e colada como texto.
// Funções puras, testadas em tests/colarTabela.test.ts.

export type LinhaClassificacao = {
  posicao: number;
  equipa: string;
  e_o_clube: boolean;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golos_marcados: number;
  golos_sofridos: number;
  pontos: number;
};

type Coluna = "j" | "v" | "e" | "d" | "gm" | "gs" | "dg" | "pts";

/** Ordens de colunas mais comuns nos sites portugueses (só as colunas numéricas, depois do nome). */
const ORDENS: Coluna[][] = [
  ["j", "v", "e", "d", "gm", "gs", "pts"],
  ["j", "v", "e", "d", "gm", "gs", "dg", "pts"],
  ["pts", "j", "v", "e", "d", "gm", "gs"],
  ["pts", "j", "v", "e", "d", "gm", "gs", "dg"],
  ["j", "v", "e", "d", "pts", "gm", "gs"],
  ["j", "pts", "v", "e", "d", "gm", "gs"],
  ["j", "pts", "v", "e", "d", "gm", "gs", "dg"],
];

const ALIAS: Record<string, Coluna> = {
  j: "j", jg: "j", jogos: "j", pj: "j",
  v: "v", vit: "v", vitorias: "v", vitórias: "v",
  e: "e", emp: "e", empates: "e",
  d: "d", der: "d", derrotas: "d",
  gm: "gm", gf: "gm", gp: "gm", marcados: "gm",
  gs: "gs", gc: "gs", sofridos: "gs",
  dg: "dg", gd: "dg", dif: "dg", "+/-": "dg", saldo: "dg",
  p: "pts", pts: "pts", pontos: "pts",
};

export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const ehNumero = (t: string) => /^[+-−]?\d+$/.test(t);
const numero = (t: string) => Number(t.replace("−", "-"));

type LinhaBruta = { posicao: number | null; equipa: string; numeros: number[] };

/** Divide uma linha em "células": por tabulações (cópia de tabela HTML) ou por espaços. */
function celulas(linha: string): string[] {
  const partes = linha.includes("\t") ? linha.split("\t") : linha.split(/\s{2,}|\s/);
  return partes
    .map((p) => p.trim())
    .filter(Boolean)
    // "14:4" ou "14-4" (golos marcados:sofridos numa só coluna) → duas células
    .flatMap((p) => (/^\d+\s*[:\-]\s*\d+$/.test(p) ? p.split(/\s*[:\-]\s*/) : [p]));
}

function lerLinha(linha: string): LinhaBruta | null {
  const cs = celulas(linha);
  if (!cs.length) return null;

  let i = 0;
  let posicao: number | null = null;
  const pos = /^(\d{1,2})[.ºª°]?$/.exec(cs[0]);
  if (pos && cs.length > 1 && !ehNumero(cs[1] ?? "")) {
    posicao = Number(pos[1]);
    i = 1;
  }

  // Nome da equipa: as células seguintes até ao primeiro número.
  const nome: string[] = [];
  while (i < cs.length && !ehNumero(cs[i])) nome.push(cs[i++]);
  const numeros = cs.slice(i).filter(ehNumero).map(numero);
  const equipa = nome.join(" ").replace(/\s+/g, " ").trim();
  if (!equipa || numeros.length < 7) return null;
  return { posicao, equipa, numeros };
}

/** Lê um cabeçalho ("Pos Equipa J V E D GM GS Pts") e devolve a ordem das colunas numéricas. */
function lerCabecalho(linha: string): Coluna[] | null {
  const cs = celulas(linha).map((c) => c.toLowerCase().replace(/\.$/, ""));
  if (cs.some(ehNumero)) return null;
  const cols = cs.map((c) => ALIAS[c]).filter((c): c is Coluna => Boolean(c));
  // "GM:GS" ou "Golos" numa só coluna = duas colunas numéricas
  const golosJuntos = cs.some((c) => /^(gm|gf)\s*[:\-]\s*(gs|gc)$/.test(c) || c === "golos");
  if (golosJuntos) {
    const idx = cs.findIndex((c) => /^(gm|gf)\s*[:\-]\s*(gs|gc)$/.test(c) || c === "golos");
    const antes = cs.slice(0, idx).map((c) => ALIAS[c]).filter(Boolean) as Coluna[];
    const depois = cs.slice(idx + 1).map((c) => ALIAS[c]).filter(Boolean) as Coluna[];
    const ordem = [...antes, "gm", "gs", ...depois] as Coluna[];
    return ordem.includes("j") && ordem.includes("pts") ? ordem : null;
  }
  return cols.includes("j") && cols.includes("pts") && cols.length >= 7 ? cols : null;
}

function aplicar(ordem: Coluna[], numeros: number[]) {
  const n = numeros.slice(0, ordem.length);
  const v = Object.fromEntries(ordem.map((c, k) => [c, n[k]])) as Record<Coluna, number>;
  return v;
}

/** Quantas regras do futebol a linha cumpre com esta ordem de colunas (0 a 3). */
function coerencia(ordem: Coluna[], numeros: number[]) {
  if (numeros.length < ordem.length) return -1;
  const x = aplicar(ordem, numeros);
  let pontos = 0;
  if (x.j === x.v + x.e + x.d) pontos++;
  if (x.pts === 3 * x.v + x.e) pontos++;
  if (!ordem.includes("dg") || x.dg === x.gm - x.gs) pontos++;
  return pontos;
}

export type ResultadoColar = {
  linhas: LinhaClassificacao[];
  /** Avisos para mostrar ao staff (linhas ignoradas, contas que não batem, etc.). */
  avisos: string[];
};

/** Ex.: "CD Exemplo" reconhece "C.D. Exemplo", "CD Exemplo B" (equipa do clube) mas não "Exemplo Futebol Clube". */
export function eOClube(equipa: string, nomesClube: string[]) {
  const e = normalizar(equipa);
  return nomesClube.map(normalizar).some((n) => n && (e === n || e.startsWith(`${n} `) || e.replace(/ /g, "") === n.replace(/ /g, "")));
}

export function lerTabelaColada(texto: string, nomesClube: string[]): ResultadoColar {
  const linhasTexto = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const avisos: string[] = [];

  let ordemCabecalho: Coluna[] | null = null;
  const brutas: LinhaBruta[] = [];

  // Algumas tabelas HTML copiadas partem cada linha em várias ("1" / "CD Exemplo" / "5 4 1 0 …").
  // Junta-se à seguinte um fragmento que comece pela posição e ainda não tenha números.
  const fragmento = (l: string) => /^\d{1,2}[.ºª°]?(\t|$)/.test(l) && celulas(l).length < 3 && !lerLinha(l);
  const juntas: string[] = [];
  for (const l of linhasTexto) {
    const anterior = juntas.at(-1);
    if (anterior !== undefined && fragmento(anterior)) {
      juntas[juntas.length - 1] = `${anterior}\t${l}`;
    } else {
      juntas.push(l);
    }
  }

  for (const l of juntas) {
    const b = lerLinha(l);
    if (b) brutas.push(b);
    else if (!ordemCabecalho) ordemCabecalho = lerCabecalho(l);
  }

  if (!brutas.length) {
    return { linhas: [], avisos: ["Não encontrei linhas de classificação no texto colado. Copia a tabela inteira do site (incluindo os números)."] };
  }

  // Escolhe a ordem de colunas: a do cabeçalho, se existir; senão a que melhor cumpre as regras.
  const candidatas = ordemCabecalho ? [ordemCabecalho, ...ORDENS] : ORDENS;
  let melhor = candidatas[0];
  let melhorPontos = -Infinity;
  for (const [k, ordem] of candidatas.entries()) {
    const total = brutas.reduce((s, b) => s + coerencia(ordem, b.numeros), 0);
    const bonus = ordemCabecalho && k === 0 ? 0.5 : 0; // em caso de empate, confia no cabeçalho
    if (total + bonus > melhorPontos) {
      melhorPontos = total + bonus;
      melhor = ordem;
    }
  }

  const linhas: LinhaClassificacao[] = brutas.map((b, k) => {
    const x = aplicar(melhor, b.numeros);
    return {
      posicao: b.posicao ?? k + 1,
      equipa: b.equipa.slice(0, 80),
      e_o_clube: eOClube(b.equipa, nomesClube),
      jogos: x.j,
      vitorias: x.v,
      empates: x.e,
      derrotas: x.d,
      golos_marcados: x.gm,
      golos_sofridos: x.gs,
      pontos: x.pts,
    };
  });

  const comProblemas = linhas.filter((l) => problemasLinha(l).length).length;
  if (comProblemas) {
    avisos.push(
      `${comProblemas} linha(s) com contas que não batem certo (assinaladas). Confirma com o site: pode ser uma penalização de pontos.`,
    );
  }
  if (!linhas.some((l) => l.e_o_clube)) avisos.push("Não reconheci a equipa do clube; marca-a na coluna ★.");
  return { linhas, avisos };
}

/** Verificações de coerência de uma linha (não bloqueiam a gravação; só alertam). */
export function problemasLinha(l: LinhaClassificacao): string[] {
  const p: string[] = [];
  if (l.jogos !== l.vitorias + l.empates + l.derrotas) p.push("J ≠ V+E+D");
  if (l.pontos !== 3 * l.vitorias + l.empates) p.push("Pts ≠ 3V+E");
  return p;
}
