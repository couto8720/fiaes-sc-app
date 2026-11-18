import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Buscar todas as fases e equipas
    const { data: fases } = await supabase
      .from("fases_torneio")
      .select("*")
      .eq("torneio_id", id)
      .order("numero_grupo");

    const { data: equipas } = await supabase
      .from("equipas_torneio")
      .select("*")
      .eq("torneio_id", id);

    if (!fases || !equipas) {
      return NextResponse.json(
        { error: "Erro ao buscar dados" },
        { status: 500 }
      );
    }

    if (fases.length === 0) {
      return NextResponse.json(
        { error: "Nenhum grupo disponível" },
        { status: 400 }
      );
    }

    // Distribuir equipas de forma equilibrada
    const atualizacoes = equipas.map((equipa, indice) => ({
      id: equipa.id,
      fase_torneio_id: fases[indice % fases.length].id,
    }));

    // Atualizar todas as equipas
    for (const atualizacao of atualizacoes) {
      const { error } = await supabase
        .from("equipas_torneio")
        .update({ fase_torneio_id: atualizacao.fase_torneio_id })
        .eq("id", atualizacao.id);

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({ sucesso: true, equipas: atualizacoes });
  } catch (erro) {
    console.error("Erro na distribuição:", erro);
    return NextResponse.json(
      { error: "Erro ao distribuir equipas" },
      { status: 500 }
    );
  }
}