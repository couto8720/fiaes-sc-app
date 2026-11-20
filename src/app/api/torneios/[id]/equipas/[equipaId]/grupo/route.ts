import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; equipaId: string }> }
) {
  try {
    const { id, equipaId } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { fase_torneio_id } = body;

    if (!fase_torneio_id) {
      return NextResponse.json(
        { error: "Fase é obrigatória" },
        { status: 400 }
      );
    }

    const { data: equipa, error } = await supabase
      .from("equipas_torneio" as any)
      .update({ fase_torneio_id } as any)
      .eq("id", equipaId)
      .eq("torneio_id", id)
      .select()
      .single();

    if (error || !equipa) {
      console.error("Erro ao atualizar equipa:", error);
      return NextResponse.json(
        { error: "Erro ao trocar grupo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, equipa });
  } catch (erro) {
    console.error("Erro na API de equipas:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}