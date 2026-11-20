import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";
import { randomUUID } from "crypto";

interface LinhaClassificacao {
  posicao: number;
  equipa: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golos_marcados: number;
  golos_sofridos: number;
  pontos: number;
}

export async function POST(request: Request) {
  try {
    const sessao = await exigirSessao();
    const supabase = await createClient();

    const { escalaoId, linhas } = await request.json() as {
      escalaoId: string;
      linhas: LinhaClassificacao[];
    };

    if (!escalaoId || !linhas || linhas.length === 0) {
      return Response.json({ message: "Dados inválidos" }, { status: 400 });
    }

    // Deletar classificações antigas para este escalão
    await supabase.from("classificacoes" as any).delete().eq("escalao_id", escalaoId);

    // Inserir novas linhas
    const classificacoes = linhas.map((linha) => ({
      escalao_id: escalaoId,
      posicao: linha.posicao,
      equipa: linha.equipa,
      e_o_clube: false,
      jogos: linha.jogos,
      vitorias: linha.vitorias,
      empates: linha.empates,
      derrotas: linha.derrotas,
      golos_marcados: linha.golos_marcados,
      golos_sofridos: linha.golos_sofridos,
      pontos: linha.pontos,
      atualizado_em: new Date().toISOString(),
    }));

    const { error } = await supabase.from("classificacoes" as any).insert(classificacoes as any);

    if (error) throw error;

    return Response.json({ success: true, total: linhas.length });
  } catch (err) {
    console.error("Erro ao salvar classificação:", err);
    return Response.json(
      { message: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
