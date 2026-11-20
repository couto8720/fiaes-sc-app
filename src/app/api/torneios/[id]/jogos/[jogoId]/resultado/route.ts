import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; jogoId: string }> }
) {
  try {
    const { id, jogoId } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { golos_equipa_1, golos_equipa_2, estado } = body;

    const { error: erroAtualizar } = await supabase
      .from("jogos_torneio" as any)
      .update({
        golos_equipa_1,
        golos_equipa_2,
        estado: estado || "final",
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", jogoId)
      .eq("torneio_id", id);

    if (erroAtualizar) {
      console.error("Erro ao atualizar jogo:", erroAtualizar);
      return NextResponse.json(
        { error: "Erro ao atualizar jogo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro na API de resultado:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
