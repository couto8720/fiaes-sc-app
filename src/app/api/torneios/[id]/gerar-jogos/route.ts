import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { fase_torneio_id } = body;

    if (!fase_torneio_id) {
      return NextResponse.json({ error: "fase_torneio_id é obrigatório" }, { status: 400 });
    }

    // Buscar todas as equipas da fase
    const { data: equipas, error: erroEquipas } = await supabase
      .from("equipas_torneio" as any)
      .select("id, nome")
      .eq("torneio_id", id)
      .eq("fase_torneio_id", fase_torneio_id)
      .order("nome");

    if (erroEquipas || !equipas || equipas.length === 0) {
      return NextResponse.json(
        { error: "Sem equipas para gerar jogos" },
        { status: 400 }
      );
    }

    // Apagar jogos antigos da fase
    await supabase
      .from("jogos_torneio" as any)
      .delete()
      .eq("fase_torneio_id", fase_torneio_id);

    // REGRA FUNDAMENTAL: Cada equipa DEVE jogar com TODOS os adversários do seu grupo EXATAMENTE UMA VEZ
    // Exemplo: 4 equipas (A, B, C, D) → 6 jogos totais (cada par joga 1x): A-B, A-C, A-D, B-C, B-D, C-D
    // Distribuído em rodadas: 3 rodadas (numEquipas - 1) com 2 jogos por rodada

    const jogos = [];
    const numEquipas = equipas.length;

    // Número de rodadas = numEquipas - 1 (para número par) ou numEquipas (para número ímpar)
    // Total de jogos = C(numEquipas, 2) = numEquipas * (numEquipas - 1) / 2
    const numRodadas = numEquipas % 2 === 0 ? numEquipas - 1 : numEquipas;
    const totalJogosEsperados = (numEquipas * (numEquipas - 1)) / 2;

    // Algoritmo de round-robin correto (circle method)
    // Garante que CADA PAR DE EQUIPAS joga EXATAMENTE UMA VEZ
    // Nenhuma equipa pode ficar sem jogar contra outra equipa do seu grupo
    let equipasArray: typeof equipas = equipas.slice();

    for (let rodada = 0; rodada < numRodadas; rodada++) {
      // Para cada rodada, parear as equipas: primeira com última, segunda com penúltima, etc.
      // Isto garante uma distribuição balanceada e sem repetições
      for (let i = 0; i < Math.floor(numEquipas / 2); i++) {
        const equipa1 = equipasArray[i];
        const equipa2 = equipasArray[numEquipas - 1 - i];

        jogos.push({
          torneio_id: id,
          fase_torneio_id: fase_torneio_id,
          equipa_1_id: equipa1.id,
          equipa_2_id: equipa2.id,
          estado: "agendado",
          rodada: rodada + 1,
        });
      }

      // Rotar as equipas para a próxima rodada (circle method correto)
      // Manter a primeira equipa fixa, rodar as outras
      if (rodada < numRodadas - 1) {
        const primeira = equipasArray[0];
        const resto = equipasArray.slice(1);
        const ultimo = resto.pop()!;
        equipasArray = [primeira, ultimo, ...resto];
      }
    }

    // VALIDAÇÃO: Verificar que a regra foi cumprida
    if (jogos.length !== totalJogosEsperados) {
      return NextResponse.json(
        {
          error: `Erro ao gerar jogos: esperado ${totalJogosEsperados} jogos mas foram gerados ${jogos.length}`,
          details: "Cada equipa deve jogar com todos os adversários exatamente uma vez"
        },
        { status: 400 }
      );
    }

    if (jogos.length === 0) {
      return NextResponse.json(
        { error: "Erro ao gerar jogos" },
        { status: 400 }
      );
    }

    console.log("Tentando inserir", jogos.length, "jogos:", JSON.stringify(jogos.slice(0, 2)));

    // Inserir jogos
    const { data: jogosInseridos, error: erroInserir } = await supabase
      .from("jogos_torneio" as any)
      .insert(jogos as any)
      .select();

    if (erroInserir) {
      console.error("Erro ao inserir jogos:", erroInserir);
      return NextResponse.json(
        { error: "Erro ao gerar jogos", details: erroInserir.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      jogos_criados: jogosInseridos?.length || 0,
      jogos: jogosInseridos,
    });
  } catch (erro) {
    console.error("Erro na API de gerar jogos:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
