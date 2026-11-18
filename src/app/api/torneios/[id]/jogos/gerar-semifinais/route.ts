import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🎮 API gerar-semifinais chamada para torneio:", id);

    const supabase = await createClient();

    // 1. Buscar fase de eliminação
    const { data: fase, error: erroFase } = await supabase
      .from("fases_torneio")
      .select("id")
      .eq("torneio_id", id)
      .eq("tipo", "eliminatoria")
      .single();

    if (erroFase || !fase) {
      console.error("Erro: Fase de eliminação não encontrada");
      return NextResponse.json(
        { error: "Fase de eliminação não encontrada" },
        { status: 400 }
      );
    }

    console.log("✅ Fase de eliminação encontrada:", fase.id);

    // 2. Buscar equipas apuradas ordenadas por posição
    const { data: apuramentos, error: erroApuramentos } = await supabase
      .from("apuramentos_torneio")
      .select("equipa_id")
      .eq("torneio_id", id)
      .order("posicao", { ascending: true });

    if (erroApuramentos || !apuramentos || apuramentos.length < 8) {
      console.error("Erro: Não há 8 equipas apuradas");
      return NextResponse.json(
        { error: `Não há equipas apuradas suficientes: ${apuramentos?.length || 0}/8` },
        { status: 400 }
      );
    }

    console.log("✅ Equipas apuradas encontradas:", apuramentos.length);

    // 3. Verificar se já existem semi-finais
    const { data: semifinaisExistentes } = await supabase
      .from("jogos_torneio")
      .select("id")
      .eq("fase_torneio_id", fase.id)
      .eq("rodada", 1);

    if (semifinaisExistentes && semifinaisExistentes.length > 0) {
      console.log("⚠️ Semi-finais já existem");
      return NextResponse.json(
        { error: "Semi-finais já foram criados" },
        { status: 400 }
      );
    }

    // 4. Criar 4 jogos de semi-finais (1º vs 8º, 2º vs 7º, 3º vs 6º, 4º vs 5º)
    const matchups = [
      { equipa_1: apuramentos[0].equipa_id, equipa_2: apuramentos[7].equipa_id }, // 1º vs 8º
      { equipa_1: apuramentos[1].equipa_id, equipa_2: apuramentos[6].equipa_id }, // 2º vs 7º
      { equipa_1: apuramentos[2].equipa_id, equipa_2: apuramentos[5].equipa_id }, // 3º vs 6º
      { equipa_1: apuramentos[3].equipa_id, equipa_2: apuramentos[4].equipa_id }, // 4º vs 5º
    ];

    for (const matchup of matchups) {
      const { error: erroJogo } = await supabase
        .from("jogos_torneio")
        .insert({
          torneio_id: id,
          fase_torneio_id: fase.id,
          equipa_1_id: matchup.equipa_1,
          equipa_2_id: matchup.equipa_2,
          rodada: 1,
          tipo_jogo: "meia_final",
          estado: "agendado",
        });

      if (erroJogo) {
        console.error("Erro ao criar semi-final:", erroJogo);
      } else {
        console.log(
          `✅ Semi-final criado: ${matchup.equipa_1} vs ${matchup.equipa_2}`
        );
      }
    }

    console.log("🎉 Todos os semi-finais foram criados com sucesso!");

    return NextResponse.json({ success: true, message: "Semi-finais gerados com sucesso" });
  } catch (erro) {
    console.error("Erro na API gerar-semifinais:", erro);
    return NextResponse.json(
      { error: `Erro interno: ${JSON.stringify(erro)}` },
      { status: 500 }
    );
  }
}
