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

    // Buscar fase de eliminação
    const { data: fases, error: erroFases } = await supabase
      .from("fases_torneio")
      .select("id")
      .eq("torneio_id", torneioId)
      .eq("tipo", "eliminatoria");

    if (erroFases || !fases || fases.length === 0) {
      return NextResponse.json({
        mensagem: "Nenhuma fase de eliminação encontrada",
        torneioId,
      });
    }

    const faseId = fases[0].id;

    // Usar RPC ou delete directo
    const { error: erroDelete } = await supabase
      .from("fases_torneio")
      .delete()
      .eq("id", faseId);

    if (erroDelete) {
      console.error("Erro ao deletar fase:", erroDelete);
      return NextResponse.json(
        { error: erroDelete.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Fase deletada com sucesso",
      faseId,
    });
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ error: String(erro) }, { status: 500 });
  }
}
