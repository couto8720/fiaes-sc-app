import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Buscar torneio
    const { data: torneio } = await supabase
      .from("torneios")
      .select("*")
      .eq("id", id)
      .single();

    if (!torneio || torneio.formato !== "grupos_eliminatoria") {
      return NextResponse.json(
        { error: "Torneio não tem fase de eliminatória configurada" },
        { status: 400 }
      );
    }

    // 2. Buscar equipas apuradas para eliminatória
    const { data: apuramentos } = await supabase
      .from("apuramentos_torneio")
      .select("equipa_id, regra:regra_id(tipo)")
      .eq("torneio_id", id);

    if (!apuramentos || apuramentos.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma equipa apurada para a eliminatória" },
        { status: 400 }
      );
    }

    // Buscar equipas completas
    const equipasIds = apuramentos.map((a) => a.equipa_id);
    const { data: equipas } = await supabase
      .from("equipas_torneio")
      .select("*")
      .in("id", equipasIds);

    if (!equipas || equipas.length === 0) {
      return NextResponse.json(
        { error: "Erro ao buscar equipas apuradas" },
        { status: 500 }
      );
    }

    // 3. Buscar ou criar fase de eliminação
    const { data: faseEliminatoria } = await supabase
      .from("fases_torneio")
      .select("*")
      .eq("torneio_id", id)
      .eq("tipo", "eliminatoria")
      .single();

    let faseId: string;
    if (!faseEliminatoria) {
      const { data: novaFase, error: erroFase } = await supabase
        .from("fases_torneio")
        .insert({
          torneio_id: id,
          nome: "Eliminatória",
          tipo: "eliminatoria",
          numero_grupo: 0,
          bloqueada: false,
        })
        .select()
        .single();

      if (erroFase || !novaFase) {
        throw new Error("Erro ao criar fase de eliminação");
      }
      faseId = novaFase.id;
    } else {
      faseId = faseEliminatoria.id;
    }

    // 4. Gerar jogos de eliminação
    const jogosParaInserir: any[] = [];
    const numEquipas = equipas.length;

    if (numEquipas === 2) {
      // Final direta
      jogosParaInserir.push({
        torneio_id: id,
        fase_torneio_id: faseId,
        equipa_1_id: equipas[0].id,
        equipa_2_id: equipas[1].id,
        rodada: 1,
        tipo_jogo: "final",
        realizado: false,
      });
    } else if (numEquipas === 4) {
      // Semi-finais
      jogosParaInserir.push(
        {
          torneio_id: id,
          fase_torneio_id: faseId,
          equipa_1_id: equipas[0].id,
          equipa_2_id: equipas[3].id,
          rodada: 1,
          tipo_jogo: "semifinal",
          realizado: false,
        },
        {
          torneio_id: id,
          fase_torneio_id: faseId,
          equipa_1_id: equipas[1].id,
          equipa_2_id: equipas[2].id,
          rodada: 1,
          tipo_jogo: "semifinal",
          realizado: false,
        }
      );

      // Disputa de 3º lugar (se configurado)
      if (torneio.tem_terceiro_lugar) {
        jogosParaInserir.push({
          torneio_id: id,
          fase_torneio_id: faseId,
          equipa_1_id: null, // Será preenchido com perdedores das semi
          equipa_2_id: null,
          rodada: 2,
          tipo_jogo: "disputa_terceiro",
          realizado: false,
        });
      }

      // Final
      jogosParaInserir.push({
        torneio_id: id,
        fase_torneio_id: faseId,
        equipa_1_id: null, // Será preenchido com vencedores das semi
        equipa_2_id: null,
        rodada: 2,
        tipo_jogo: "final",
        realizado: false,
      });
    } else if (numEquipas === 8) {
      // Quartas, semi-finais, final
      const quartas = [
        [0, 7],
        [3, 4],
        [1, 6],
        [2, 5],
      ];

      quartas.forEach((par, idx) => {
        jogosParaInserir.push({
          torneio_id: id,
          fase_torneio_id: faseId,
          equipa_1_id: equipas[par[0]].id,
          equipa_2_id: equipas[par[1]].id,
          rodada: 1,
          tipo_jogo: "quarta",
          realizado: false,
        });
      });

      // Semi-finais
      for (let i = 0; i < 2; i++) {
        jogosParaInserir.push({
          torneio_id: id,
          fase_torneio_id: faseId,
          equipa_1_id: null,
          equipa_2_id: null,
          rodada: 2,
          tipo_jogo: "semifinal",
          realizado: false,
        });
      }

      // Final
      jogosParaInserir.push({
        torneio_id: id,
        fase_torneio_id: faseId,
        equipa_1_id: null,
        equipa_2_id: null,
        rodada: 3,
        tipo_jogo: "final",
        realizado: false,
      });
    }

    // 5. Limpar jogos antigos da eliminatória
    await supabase
      .from("jogos_torneio")
      .delete()
      .eq("torneio_id", id)
      .eq("fase_torneio_id", faseId);

    // 6. Inserir novos jogos
    if (jogosParaInserir.length > 0) {
      const { error: erroJogos } = await supabase
        .from("jogos_torneio")
        .insert(jogosParaInserir);

      if (erroJogos) {
        console.error("Erro ao inserir jogos:", erroJogos);
        return NextResponse.json(
          { error: "Erro ao gerar jogos de eliminação" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      sucesso: true,
      faseId,
      jogosGerados: jogosParaInserir.length,
    });
  } catch (erro) {
    console.error("Erro na geração de jogos:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
