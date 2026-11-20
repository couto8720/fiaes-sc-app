import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const torneioId = searchParams.get("torneio_id");

    if (!torneioId) {
      return NextResponse.json({ error: "torneio_id obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();

    // Buscar um exemplo de jogo existente
    const { data: jogosExemplo, error } = await supabase
      .from("jogos_torneio" as any)
      .select("*")
      .eq("torneio_id", torneioId)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    if (!jogosExemplo || jogosExemplo.length === 0) {
      return NextResponse.json({
        mensagem: "Nenhum jogo encontrado para este torneio",
        torneioId,
      });
    }

    const jogo = jogosExemplo[0];

    // Retornar estrutura do jogo
    return NextResponse.json({
      sucesso: true,
      exemplo: jogo,
      colunas: Object.keys(jogo),
      estrutura: Object.entries(jogo).map(([key, value]) => ({
        coluna: key,
        tipo: typeof value,
        valor: value,
      })),
    });
  } catch (erro) {
    console.error("Erro na inspeção:", erro);
    return NextResponse.json({ error: String(erro) }, { status: 500 });
  }
}
