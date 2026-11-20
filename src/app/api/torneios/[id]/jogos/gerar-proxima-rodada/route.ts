import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("✅ API gerar-proxima-rodada chamada para torneio:", id);
    const supabase = await createClient();

    // 1. Buscar fase de eliminação
    const { data: fase } = await supabase
      .from("fases_torneio" as any)
      .select("id")
      .eq("torneio_id", id)
      .eq("tipo", "eliminatoria")
      .single();

    if (!fase) {
      return NextResponse.json(
        { error: "Fase de eliminação não encontrada" },
        { status: 400 }
      );
    }

    // 2. Buscar semi-finais completadas
    const { data: semifinais } = await supabase
      .from("jogos_torneio" as any)
      .select(
        `
        id,
        equipa_1_id,
        equipa_2_id,
        golos_equipa_1,
        golos_equipa_2,
        rodada
      `
      )
      .eq("torneio_id", id)
      .eq("fase_torneio_id", fase.id)
      .eq("rodada", 1)
      .order("id");

    if (!semifinais || semifinais.length < 2) {
      return NextResponse.json(
        { error: "Semi-finais não completadas" },
        { status: 400 }
      );
    }

    // Verificar se ambas têm resultado
    if (
      semifinais.some(
        (s) => s.golos_equipa_1 === null || s.golos_equipa_2 === null
      )
    ) {
      return NextResponse.json(
        { error: "Nem todos os semi-finais têm resultado" },
        { status: 400 }
      );
    }

    // 3. Determinar vencedores e perdedores
    const sf1 = semifinais[0];
    const sf2 = semifinais[1];

    const vencedor1 =
      sf1.golos_equipa_1! > sf1.golos_equipa_2! ? sf1.equipa_1_id : sf1.equipa_2_id;
    const perdedor1 =
      sf1.golos_equipa_1! > sf1.golos_equipa_2! ? sf1.equipa_2_id : sf1.equipa_1_id;

    const vencedor2 =
      sf2.golos_equipa_1! > sf2.golos_equipa_2! ? sf2.equipa_1_id : sf2.equipa_2_id;
    const perdedor2 =
      sf2.golos_equipa_1! > sf2.golos_equipa_2! ? sf2.equipa_2_id : sf2.equipa_1_id;

    console.log("Vencedores:", vencedor1, vencedor2);
    console.log("Perdedores:", perdedor1, perdedor2);

    // 4. Verificar se já existem jogos de rodada 2
    const { data: jogosRodada2 } = await supabase
      .from("jogos_torneio" as any)
      .select("id")
      .eq("torneio_id", id)
      .eq("fase_torneio_id", fase.id)
      .eq("rodada", 2);

    if (jogosRodada2 && jogosRodada2.length > 0) {
      return NextResponse.json(
        { error: "Jogos de rodada 2 já existem" },
        { status: 400 }
      );
    }

    // 5. Criar jogos de rodada 2 (disputa de 3º e final)
    const novosjogos = [
      {
        torneio_id: id,
        fase_torneio_id: fase.id,
        equipa_1_id: perdedor1,
        equipa_2_id: perdedor2,
        rodada: 2,
        golos_equipa_1: null,
        golos_equipa_2: null,
      },
      {
        torneio_id: id,
        fase_torneio_id: fase.id,
        equipa_1_id: vencedor1,
        equipa_2_id: vencedor2,
        rodada: 2,
        golos_equipa_1: null,
        golos_equipa_2: null,
      },
    ];

    const { data: jogosInseridos, error: erroJogos } = await supabase
      .from("jogos_torneio" as any)
      .insert(novosjogos as any)
      .select();

    if (erroJogos || !jogosInseridos) {
      console.error("Erro ao inserir jogos:", erroJogos);
      return NextResponse.json(
        { error: erroJogos?.message || "Erro ao criar jogos de rodada 2" },
        { status: 500 }
      );
    }

    console.log("✅ Jogos de rodada 2 criados com sucesso");

    return NextResponse.json({
      sucesso: true,
      mensagem: "Jogos de disputa de 3º lugar e final criados com sucesso",
      jogos: 2,
    });
  } catch (erro) {
    console.error("Erro na geração de próxima rodada:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
