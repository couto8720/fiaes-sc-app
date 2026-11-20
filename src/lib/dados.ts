// Leitura dos dados públicos. Usa o Supabase quando está configurado;
// caso contrário, os dados de demonstração (ver lib/demo.ts).
import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient } from "./supabase/publico";
import { supabaseConfigurado } from "./supabase/env";
import type { Classificacao, ClubeConfig, Escalao, Jogo, Local } from "./supabase/database.types";
import { CLASSIFICACOES_DEMO, CONFIG_DEMO, ESCALOES_DEMO, jogosDemo } from "./demo";
import type { Expulsao, Golo } from "./marcadores";

export type JogoCompleto = Jogo & {
  escalao: Pick<Escalao, "nome" | "slug" | "ordem"> | null;
  local: Pick<Local, "nome" | "maps_url"> | null;
  /** Marcadores do Fiães SC (nome já na forma curta). */
  golos: Golo[];
  /** Cartões vermelhos (do clube com o nome curto do atleta, quando indicado). */
  expulsoes: Expulsao[];
};

export const modoDemo = !supabaseConfigurado;

const SELECT_JOGO =
  "*, escalao:escaloes(nome, slug, ordem), local:locais(nome, maps_url), golos(marcador, minuto, penalti), expulsoes(lado, atleta, minuto)";

// Hora do pedido. connection() marca o render como "por pedido" (exigido pelo Cache Components).
export const agora = cache(async () => {
  await connection();
  return Date.now();
});

export const obterConfig = cache(async (): Promise<ClubeConfig> => {
  await connection();
  if (modoDemo) return CONFIG_DEMO;
  const { data } = await createPublicClient().from("clube_config" as any).select("*").maybeSingle();
  return data ?? CONFIG_DEMO;
});

export const obterEscaloes = cache(async (): Promise<Escalao[]> => {
  await connection();
  if (modoDemo) return ESCALOES_DEMO;
  const { data, error } = await createPublicClient()
    .from("escaloes" as any).select("*").eq("ativo", true).order("ordem");
  if (error) throw error;
  return data;
});

export const obterEscalao = cache(async (slug: string) =>
  (await obterEscaloes()).find((e) => e.slug === slug) ?? null,
);

type FiltroJogos = {
  desde?: Date;
  ate?: Date;
  escalaoId?: string;
  ordem?: "asc" | "desc";
};

export async function obterJogos({ desde, ate, escalaoId, ordem = "asc" }: FiltroJogos = {}): Promise<JogoCompleto[]> {
  const t = await agora();
  if (modoDemo) {
    return jogosDemo(t)
      .filter((j) => (!desde || j.data_hora >= desde.toISOString()) && (!ate || j.data_hora < ate.toISOString()))
      .filter((j) => !escalaoId || j.escalao_id === escalaoId)
      .sort((a, b) => (ordem === "asc" ? 1 : -1) * a.data_hora.localeCompare(b.data_hora));
  }
  let q = createPublicClient().from("jogos" as any).select(SELECT_JOGO);
  if (desde) q = q.gte("data_hora", desde.toISOString());
  if (ate) q = q.lt("data_hora", ate.toISOString());
  if (escalaoId) q = q.eq("escalao_id", escalaoId);
  const { data, error } = await q.order("data_hora", { ascending: ordem === "asc" }).limit(500);
  if (error) throw error;
  return data;
}

export const obterJogo = cache(async (id: string): Promise<JogoCompleto | null> => {
  const t = await agora();
  if (modoDemo) return jogosDemo(t).find((j) => j.id === id) ?? null;
  // Evita um erro do Postgres com ids que não são UUID (ex.: links antigos ou mal copiados).
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await createPublicClient().from("jogos" as any).select(SELECT_JOGO).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
});

export async function obterClassificacoes(escalaoId?: string): Promise<Classificacao[]> {
  await connection();
  if (modoDemo) {
    return CLASSIFICACOES_DEMO.filter((c) => !escalaoId || c.escalao_id === escalaoId);
  }
  let q = createPublicClient().from("classificacoes" as any).select("*");
  if (escalaoId) q = q.eq("escalao_id", escalaoId);
  const { data, error } = await q.order("posicao");
  if (error) throw error;
  return data;
}

export async function obterTorneios() {
  await connection();
  if (modoDemo) return [];
  const { data, error } = await createPublicClient()
    .from("torneios" as any)
    .select("*")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data || [];
}
