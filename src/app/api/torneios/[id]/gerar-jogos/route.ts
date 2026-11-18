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
      .from("equipas_torneio")
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
      .from("jogos_torneio")
      .delete()
      .eq("fase_torneio_id", fase_torneio_id);

    // Gerar todos os jogos possíveis com round-robin de rodadas
    const jogos = [];
    const numEquipas = equipas.length;

    // Algoritmo de round-robin: cada equipa joga uma vez por rodada
    // Número de rodadas = numEquipas - 1 (para número par) ou numEquipas (para número ímpar)
    const numRodadas = numEquipas % 2 === 0 ? numEquipas - 1 : numEquipas;

    for (let rodada = 0; rodada < numRodadas; rodada++) {
      // Algoritmo de round-robin circular
      for (let i = 0; i < Math.floor(numEquipas / 2); i++) {
        let idx1 = (rodada + i) % numEquipas;
        let idx2 = (rodada + numEquipas - 1 - i) % numEquipas;

        // Evitar jogo de equipa contra ela mesma
        if (idx1 !== idx2) {
          jogos.push({
            torneio_id: id,
            fase_torneio_id: fase_torneio_id,
            equipa_1_id: equipas[idx1].id,
            equipa_2_id: equipas[idx2].id,
            estado: "agendado",
          });
        }
      }
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
      .from("jogos_torneio")
      .insert(jogos)
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
