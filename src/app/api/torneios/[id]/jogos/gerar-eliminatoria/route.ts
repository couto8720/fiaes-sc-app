import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("✅ API gerar-eliminatoria chamada para torneio:", id);
    const supabase = await createClient();

    // 1. Buscar equipas apuradas COM A RELAÇÃO DE EQUIPAS
    const { data: apuramentos, error: erroApuramentos } = await supabase
      .from("apuramentos_torneio")
      .select("id, equipa_id, equipa:equipa_id(id, nome)")
      .eq("torneio_id", id)
      .order("id");

    console.log("Apuramentos encontrados:", JSON.stringify(apuramentos, null, 2));

    if (erroApuramentos) {
      console.error("Erro ao buscar apuramentos:", erroApuramentos);
      return NextResponse.json(
        { error: erroApuramentos.message },
        { status: 400 }
      );
    }

    if (!apuramentos || apuramentos.length < 4) {
      return NextResponse.json(
        { error: "É necessário ter 4 equipas apuradas para gerar a eliminatória" },
        { status: 400 }
      );
    }

    // Verificar se equipas estão carregadas
    const equipasValidas = apuramentos.filter((a) => a.equipa && a.equipa.id);
    console.log("Equipas válidas encontradas:", equipasValidas.length);
    if (equipasValidas.length < 4) {
      console.error("Equipas não carregadas correctamente:", apuramentos);
      return NextResponse.json(
        { error: "Erro ao carregar dados das equipas apuradas" },
        { status: 500 }
      );
    }

    // 2. Deletar fase anterior se existir (limpeza automática)
    console.log("Limpando fases anteriores...");
    const { data: fasesExistentes } = await supabase
      .from("fases_torneio")
      .select("id")
      .eq("torneio_id", id)
      .eq("tipo", "eliminatoria");

    console.log("Fases de eliminação encontradas:", fasesExistentes?.length || 0);
    if (fasesExistentes && fasesExistentes.length > 0) {
      const faseIdAnterior = fasesExistentes[0].id;
      console.log("Deletando jogos da fase anterior...");
      await supabase
        .from("jogos_torneio")
        .delete()
        .eq("fase_torneio_id", faseIdAnterior);

      console.log("Deletando fase anterior...");
      await supabase
        .from("fases_torneio")
        .delete()
        .eq("id", faseIdAnterior);
    }

    console.log("✅ Pronto para criar nova fase de eliminação...");

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
    const equipasArray = apuramentos.map((a) => a.equipa).filter((e) => e !== null);

    console.log("Equipas para jogos:", JSON.stringify(equipasArray, null, 2));

    if (equipasArray.length < 4) {
      console.error("Equipas insuficientes para criar jogos:", equipasArray);
      return NextResponse.json(
        { error: "Não foi possível carregar as 4 equipas apuradas" },
        { status: 500 }
      );
    }

    const agora = new Date().toISOString();
    const jogos = [
      // Semi-finais (rodada 1)
      {
        torneio_id: id,
        fase_torneio_id: faseNova.id,
        equipa_1_id: equipasArray[0].id,
        equipa_2_id: equipasArray[2].id,
        rodada: 1,
        golos_equipa_1: null,
        golos_equipa_2: null,
      },
      {
        torneio_id: id,
        fase_torneio_id: faseNova.id,
        equipa_1_id: equipasArray[1].id,
        equipa_2_id: equipasArray[3].id,
        rodada: 1,
        golos_equipa_1: null,
        golos_equipa_2: null,
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