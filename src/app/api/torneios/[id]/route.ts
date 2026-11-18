import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { nome, descricao, formato, num_grupos, equipas_por_grupo, avancar_por_grupo, vitoria_pontos, empate_pontos, estado } = body;

    // Validar
    if (!nome || !formato) {
      return NextResponse.json({ error: "Dados obrigatórios faltam" }, { status: 400 });
    }

    // Atualizar torneio
    const { error: erroAtualizacao } = await supabase
      .from("torneios")
      .update({
        nome,
        descricao,
        formato,
        num_grupos,
        equipas_por_grupo,
        avancar_por_grupo,
        vitoria_pontos,
        empate_pontos,
        estado,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (erroAtualizacao) {
      console.error("Erro ao atualizar torneio:", erroAtualizacao);
      return NextResponse.json({ error: "Erro ao atualizar torneio" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error("Erro na API de torneios:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // Deletar torneio
    const { error } = await supabase.from("torneios").delete().eq("id", params.id);

    if (error) {
      console.error("Erro ao deletar torneio:", error);
      return NextResponse.json({ error: "Erro ao deletar torneio" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error("Erro na API de torneios:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
