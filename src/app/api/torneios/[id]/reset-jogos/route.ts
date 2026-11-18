import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Deletar TODOS os jogos do torneio
    const { error: erroDelete } = await supabase
      .from("jogos_torneio")
      .delete()
      .eq("torneio_id", id);

    if (erroDelete) {
      console.error("Erro ao deletar jogos:", erroDelete);
      return NextResponse.json(
        { error: "Erro ao deletar jogos", details: erroDelete.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Todos os jogos foram deletados. Execute gerar-jogos para criar novos.",
    });
  } catch (erro) {
    console.error("Erro na API de reset:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
