import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Buscar equipas apuradas
    const { data: apuramentos, error: erroApuramentos } = await supabase
      .from("apuramentos_torneio")
      .select("*, equipa:equipa_id(id, nome)")
      .eq("torneio_id", id)
      .order("id"); // Manter ordem de inserção

    if (erroApuramentos || !apuramentos || apuramentos.length < 4) {
      return NextResponse.json(
        { error: "É necessário ter 4 equipas apuradas para gerar a eliminatória" },
        { status: 400 }
      );
    }

    // 2. Verificar se já existe fase de eliminação
    const { data: fasesExistentes } = await supabase
      .from("fases_torneio")
      .select("id")
      .eq("torneio_id", id)
      .eq("tipo", "eliminatoria");

    if (fasesExistentes && fasesExistentes.length > 0) {
      return NextResponse.json(
        { error: "Fase de eliminação já existe" },
        { status: 400 }
      );
    }

    // 3. Criar fase de eliminação
    const { data: novasFases, error: erroFase } = await supabase
      .from("fases_torneio")
      .insert({
        torneio_id: id,
        nome: "Eliminatória",
        tipo: "eliminatoria",
        numero_grupo: null,
      })
      .select();

    if (erroFase || !novasFases || novasFases.length === 0) {
      console.error("Erro ao criar fase:", erroFase);
      return NextResponse.json(
        { error: erroFase?.message || "Erro ao criar fase de eliminação" },
        { status: 500 }
      );
    }

    const faseNova = novasFases[0];

    // 4. Preparar os jogos
    const equipas = apuramentos.map((a) => a.equipa);
    const agora = new Date().toISOString();
    const jogos = [
      // Semi-finais (rodada 1)
      {
        torneio_id: id,
        fase_torneio_id: faseNova.id,
        equipa_1_id: equipas[0]?.id,
        equipa_2_id: equipas[2]?.id,
        tipo_jogo: "semifinal",
        rodada: 1,
        golos_equipa_1: null,
        golos_equipa_2: null,
        realizado: false,
        estado: "pendente",
        criado_em: agora,
        atualizado_em: agora,
      },
      {
        torneio_id: id,
        fase_torneio_id: faseNova.id,
        equipa_1_id: equipas[1]?.id,
        equipa_2_id: equipas[3]?.id,
        tipo_jogo: "semifinal",
        rodada: 1,
        golos_equipa_1: null,
        golos_equipa_2: null,
        realizado: false,
        estado: "pendente",
        criado_em: agora,
        atualizado_em: agora,
      },
      // Disputa de 3º lugar (rodada 2)
      {
        torneio_id: id,
        fase_torneio_id: faseNova.id,
        equipa_1_id: null,
        equipa_2_id: null,
        tipo_jogo: "disputa_terceiro",
        rodada: 2,
        golos_equipa_1: null,
        golos_equipa_2: null,
        realizado: false,
        estado: "pendente",
        criado_em: agora,
        atualizado_em: agora,
      },
      // Final (rodada 2)
      {
        torneio_id: id,
        fase_torneio_id: faseNova.id,
        equipa_1_id: null,
        equipa_2_id: null,
        tipo_jogo: "final",
        rodada: 2,
        golos_equipa_1: null,
        golos_equipa_2: null,
        realizado: false,
        estado: "pendente",
        criado_em: agora,
        atualizado_em: agora,
      },
    ];

    // 5. Inserir jogos
    console.log("Tentando inserir jogos:", JSON.stringify(jogos, null, 2));
    const { data: jogosInseridos, error: erroJogos } = await supabase
      .from("jogos_torneio")
      .insert(jogos)
      .select();

    console.log("Jogos inseridos:", jogosInseridos);
    if (erroJogos) {
      console.error("Erro ao inserir jogos:", JSON.stringify(erroJogos, null, 2));
    }

    if (erroJogos || !jogosInseridos || jogosInseridos.length === 0) {
      console.error("Erro ao inserir jogos - detalhes:", erroJogos);
      return NextResponse.json(
        { error: erroJogos?.message || "Erro ao criar jogos de eliminação" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Fase de eliminação criada com sucesso",
      faseId: faseNova.id,
      jogos: 4,
    });
  } catch (erro) {
    console.error("Erro na geração de eliminatória:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}