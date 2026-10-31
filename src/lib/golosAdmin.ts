import "server-only";
import { createClient } from "./supabase/server";

/** Golos de um jogo (para editar) e nomes já usados no escalão (atalhos no painel). */
export async function golosParaEditar(jogoId: string, escalaoId: string) {
  const supabase = await createClient();
  const [{ data: golos }, { data: jogosEscalao }] = await Promise.all([
    supabase.from("golos").select("id, marcador, minuto, penalti").eq("jogo_id", jogoId).order("minuto", { nullsFirst: false }),
    supabase.from("jogos").select("id").eq("escalao_id", escalaoId),
  ]);
  const ids = (jogosEscalao ?? []).map((j) => j.id);
  const { data: usados } = ids.length
    ? await supabase.from("golos").select("marcador").in("jogo_id", ids).limit(1000)
    : { data: [] };

  // Os mais frequentes primeiro (quem marca mais aparece primeiro nos atalhos).
  const contagem = new Map<string, number>();
  for (const { marcador } of usados ?? []) {
    if (marcador.toLowerCase() !== "autogolo") contagem.set(marcador, (contagem.get(marcador) ?? 0) + 1);
  }
  const sugestoes = [...contagem.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
  return { golos: golos ?? [], sugestoes };
}
