import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const torneioId = searchParams.get("torneio_id");

    if (!torneioId) {
      return NextResponse.json({ error: "torneio_id obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Buscar fase de eliminação
    const { data: fases } = await supabase
      .from("fases_torneio" as any)
      .select("id")
      .eq("torneio_id", torneioId)
      .eq("tipo", "eliminatoria");

    if (!fases || fases.length === 0) {
      return NextResponse.json({ mensagem: "Nenhuma fase de eliminação encontrada" });
    }

    const faseId = fases[0].id;

    // 2. Deletar jogos desta fase
    const { error: erroJogos } = await supabase
      .from("jogos_torneio" as any)
      .delete()
      .eq("fase_torneio_id", faseId);

    if (erroJogos) {
      console.error("Erro ao deletar jogos:", erroJogos);
      return NextResponse.json(
        { error: "Erro ao deletar jogos" },
        { status: 500 }
      );
    }

    // 3. Deletar fase
    const { error: erroFase } = await supabase
      .from("fases_torneio" as any)
      .delete()
      .eq("id", faseId);

    if (erroFase) {
      console.error("Erro ao deletar fase:", erroFase);
      return NextResponse.json(
        { error: "Erro ao deletar fase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Fase de eliminação deletada com sucesso",
    });
  } catch (erro) {
    console.error("Erro na limpeza:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
