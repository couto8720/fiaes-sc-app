// Regras do marcador ao vivo (funções puras, testadas em tests/marcador.test.ts).
import type { EstadoJogo } from "./supabase/database.types";

export type ValoresMarcador = {
  estado: EstadoJogo;
  golos_clube: number | null;
  golos_adversario: number | null;
};

export type Lado = "clube" | "adversario";

const EM_JOGO: EstadoJogo[] = ["primeira_parte", "intervalo", "segunda_parte", "final"];

/** Só se marcam golos com o jogo a decorrer ou terminado (para corrigir). */
export const podeMarcar = (estado: EstadoJogo) => EM_JOGO.includes(estado);

/** O botão principal: avança sempre para o passo seguinte do jogo. */
export const ACAO_SEGUINTE: Record<EstadoJogo, { seguinte: EstadoJogo; rotulo: string; confirmar?: string } | null> = {
  agendado: { seguinte: "primeira_parte", rotulo: "Começar jogo" },
  primeira_parte: { seguinte: "intervalo", rotulo: "Intervalo" },
  intervalo: { seguinte: "segunda_parte", rotulo: "Começar 2.ª parte" },
  segunda_parte: { seguinte: "final", rotulo: "Terminar jogo", confirmar: "Terminar o jogo? O resultado fica como final." },
  final: null,
  adiado: null,
  cancelado: null,
};

/** Para desfazer um toque por engano ("Voltar a …"). */
export const ESTADO_ANTERIOR: Partial<Record<EstadoJogo, EstadoJogo>> = {
  primeira_parte: "agendado",
  intervalo: "primeira_parte",
  segunda_parte: "intervalo",
  final: "segunda_parte",
  adiado: "agendado",
  cancelado: "agendado",
};

export function mudarEstado(v: ValoresMarcador, novo: EstadoJogo): ValoresMarcador {
  if (podeMarcar(novo)) {
    return { estado: novo, golos_clube: v.golos_clube ?? 0, golos_adversario: v.golos_adversario ?? 0 };
  }
  // Voltar a "agendado" depois de começar por engano: se ainda estava 0-0, o jogo fica outra vez sem resultado.
  if (novo === "agendado" && !v.golos_clube && !v.golos_adversario) {
    return { estado: novo, golos_clube: null, golos_adversario: null };
  }
  return { ...v, estado: novo };
}

/** +1 / −1 golo. Devolve null quando não se pode marcar ou o valor não mudaria. */
export function marcarGolo(v: ValoresMarcador, lado: Lado, delta: 1 | -1): ValoresMarcador | null {
  if (!podeMarcar(v.estado)) return null;
  const campo = lado === "clube" ? "golos_clube" : "golos_adversario";
  const atual = v[campo] ?? 0;
  const novo = Math.min(99, Math.max(0, atual + delta));
  if (novo === atual) return null;
  return { ...v, [campo]: novo };
}

export const iguais = (a: ValoresMarcador, b: ValoresMarcador) =>
  a.estado === b.estado && a.golos_clube === b.golos_clube && a.golos_adversario === b.golos_adversario;

/** Espera antes de voltar a tentar gravar: 1 s, 2 s, 4 s … até 30 s. */
export const esperaNovaTentativa = (tentativa: number) => Math.min(30_000, 1000 * 2 ** tentativa);
