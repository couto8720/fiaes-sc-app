import type { EstadoJogo, Jogo } from "./supabase/database.types";
import { somarDias } from "./datas.ts";

export const ROTULO_ESTADO: Record<EstadoJogo, string> = {
  agendado: "Agendado",
  primeira_parte: "1.ª Parte",
  intervalo: "Intervalo",
  segunda_parte: "2.ª Parte",
  final: "Final do Jogo",
  adiado: "Adiado",
  cancelado: "Cancelado",
};

export const ESTADOS_AO_VIVO: EstadoJogo[] = ["primeira_parte", "intervalo", "segunda_parte"];
export const aoVivo = (estado: EstadoJogo) => ESTADOS_AO_VIVO.includes(estado);

// Fluxo normal de um jogo; o botão principal do marcador avança para o estado seguinte.
const SEQUENCIA: EstadoJogo[] = ["agendado", "primeira_parte", "intervalo", "segunda_parte", "final"];

export function proximoEstado(estado: EstadoJogo): EstadoJogo | null {
  const i = SEQUENCIA.indexOf(estado);
  return i >= 0 && i < SEQUENCIA.length - 1 ? SEQUENCIA[i + 1] : null;
}

// ---------- Datas (sempre em Europe/Lisbon, igual no servidor e no browser) ----------

export const FUSO = "Europe/Lisbon";
const DIA_MS = 86_400_000;

const fmtChaveDia = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHora = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" });
const fmtDiaLongo = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, weekday: "long", day: "numeric", month: "long" });
const fmtDiaCurto = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, weekday: "short", day: "2-digit", month: "2-digit" });

/** "2026-10-28" no fuso de Lisboa; serve para agrupar e comparar dias. */
export const chaveDia = (d: string | number) => fmtChaveDia.format(new Date(d));
export const formatarHora = (iso: string) => fmtHora.format(new Date(iso));
export const formatarDiaCurto = (iso: string) => fmtDiaCurto.format(new Date(iso));

/** "sábado, 31 de outubro" */
export const formatarDiaLongo = (iso: string) => fmtDiaLongo.format(new Date(iso));

const fmtDiaSemanaCurto = new Intl.DateTimeFormat("pt-PT", { timeZone: FUSO, weekday: "short" });
const MESES_CURTOS = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

/** "Dom., 1 nov." — etiqueta curta para os cartões (cabe no telemóvel). */
export function formatarDiaEtiqueta(iso: string) {
  const [, m, d] = chaveDia(iso).split("-").map(Number);
  const semana = fmtDiaSemanaCurto.format(new Date(iso));
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${d} ${MESES_CURTOS[m - 1]}`;
}

export function formatarDataHora(iso: string) {
  return `${formatarDiaCurto(iso)} · ${formatarHora(iso)}`;
}

/** "Hoje", "Amanhã", "Ontem" ou "sábado, 1 de novembro". */
export function rotuloDia(iso: string, agora: number) {
  const dia = chaveDia(iso);
  if (dia === chaveDia(agora)) return "Hoje";
  if (dia === chaveDia(agora + DIA_MS)) return "Amanhã";
  if (dia === chaveDia(agora - DIA_MS)) return "Ontem";
  const t = fmtDiaLongo.format(new Date(iso));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Agrupa jogos (já ordenados) por dia, mantendo a ordem. */
export function agruparPorDia<T extends Pick<Jogo, "data_hora">>(jogos: T[]) {
  const grupos: { dia: string; jogos: T[] }[] = [];
  for (const j of jogos) {
    const dia = chaveDia(j.data_hora);
    const ultimo = grupos.at(-1);
    if (ultimo?.dia === dia) ultimo.jogos.push(j);
    else grupos.push({ dia, jogos: [j] });
  }
  return grupos;
}

// ---------- Feed por semanas (segunda a domingo, hora de Lisboa) ----------

export type GruposSemana<T> = {
  aoVivo: T[];
  estaSemana: T[];
  proximaSemana: T[];
  anteriores: T[];
};

/** Segunda-feira da semana de um dia ("2026-10-31" → "2026-10-26"). */
export function segundaDaSemana(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  const diaSemana = new Date(Date.UTC(a, m - 1, d)).getUTCDay(); // 0 = domingo
  return somarDias(dia, -((diaSemana + 6) % 7));
}

/**
 * Agrupa os jogos para a página inicial:
 * ao vivo · esta semana (todos, por ordem) · próxima semana · jogos anteriores (terminados, do mais recente).
 */
export function agruparPorSemana<T extends Pick<Jogo, "data_hora" | "estado">>(jogos: T[], agora: number): GruposSemana<T> {
  const segunda = segundaDaSemana(chaveDia(agora));
  const proximaSegunda = somarDias(segunda, 7);
  const segundaSeguinte = somarDias(segunda, 14);
  const g: GruposSemana<T> = { aoVivo: [], estaSemana: [], proximaSemana: [], anteriores: [] };
  for (const j of [...jogos].sort((a, b) => a.data_hora.localeCompare(b.data_hora))) {
    const dia = chaveDia(j.data_hora);
    if (aoVivo(j.estado)) g.aoVivo.push(j);
    else if (dia >= segunda && dia < proximaSegunda) g.estaSemana.push(j);
    else if (dia >= proximaSegunda && dia < segundaSeguinte) g.proximaSemana.push(j);
    else if (dia < segunda && j.estado === "final") g.anteriores.push(j);
  }
  g.anteriores.reverse();
  return g;
}

// ---------- Equipas e resultado ----------

/** Equipa da casa primeiro, como é habitual no futebol. */
export function equipas(jogo: Pick<Jogo, "em_casa" | "adversario" | "golos_clube" | "golos_adversario">, nomeClube: string) {
  const clube = { nome: nomeClube, golos: jogo.golos_clube, eClube: true };
  const adv = { nome: jogo.adversario, golos: jogo.golos_adversario, eClube: false };
  return jogo.em_casa ? [clube, adv] : [adv, clube];
}

export type Desfecho = "vitoria" | "empate" | "derrota" | null;

export function desfecho(jogo: Pick<Jogo, "estado" | "golos_clube" | "golos_adversario">): Desfecho {
  if (jogo.estado !== "final" || jogo.golos_clube === null || jogo.golos_adversario === null) return null;
  if (jogo.golos_clube > jogo.golos_adversario) return "vitoria";
  if (jogo.golos_clube < jogo.golos_adversario) return "derrota";
  return "empate";
}

/** "CD Exemplo 2–1 Outro SC" ou "CD Exemplo vs Outro SC". */
export function resumoJogo(jogo: Pick<Jogo, "em_casa" | "adversario" | "golos_clube" | "golos_adversario">, nomeClube: string) {
  const [casa, fora] = equipas(jogo, nomeClube);
  return casa.golos === null || fora.golos === null
    ? `${casa.nome} vs ${fora.nome}`
    : `${casa.nome} ${casa.golos}–${fora.golos} ${fora.nome}`;
}
