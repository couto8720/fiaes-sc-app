import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; equipaId: string }> }
) {
  try {
    const { id, equipaId } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from("equipas_torneio" as any)
      .delete()
      .eq("id", equipaId)
      .eq("torneio_id", id);

    if (error) {
      console.error("Erro ao deletar equipa:", error);
      let mensagem = "Erro ao remover equipa";
      if (error.code === "23503") {
        mensagem = "Não é possível remover esta equipa pois possui jogos ou outras associações";
      }
      return NextResponse.json(
        { error: mensagem },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro na API de equipas:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}