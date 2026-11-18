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

    // Gerar todos os jogos possíveis (round-robin)
    const jogos = [];
    for (let i = 0; i < equipas.length; i++) {
      for (let j = i + 1; j < equipas.length; j++) {
        jogos.push({
          torneio_id: id,
          fase_torneio_id: fase_torneio_id,
          equipa1_id: equipas[i].id,
          equipa2_id: equipas[j].id,
          nome: `${equipas[i].nome} vs ${equipas[j].nome}`,
          estado: "planejamento",
        });
      }
    }

    if (jogos.length === 0) {
      return NextResponse.json(
        { error: "Precisa de pelo menos 2 equipas para gerar jogos" },
        { status: 400 }
      );
    }

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
