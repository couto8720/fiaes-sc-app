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
      .from("equipas_torneio")
      .delete()
      .eq("id", equipaId)
      .eq("torneio_id", id);

    if (error) {
      console.error("Erro ao deletar equipa:", error);
      return NextResponse.json(
        { error: "Erro ao remover equipa" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro na API de equipas:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}