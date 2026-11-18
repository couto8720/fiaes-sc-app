import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { regras } = body;

    if (!regras || regras.length === 0) {
      return NextResponse.json(
        { error: "Deve haver pelo menos uma regra de qualificação" },
        { status: 400 }
      );
    }

    // Remover regras antigas
    await supabase
      .from("regras_qualificacao_torneio")
      .delete()
      .eq("torneio_id", id);

    // Inserir novas regras
    const regrasComOrdem = regras.map((regra, idx) => ({
      torneio_id: id,
      nome: regra.nome,
      descricao: regra.descricao,
      tipo: regra.tipo,
      criterio: regra.criterio,
      num_equipas: regra.num_equipas,
      posicoes: regra.posicoes || [],
      ordem: idx + 1,
    }));

    const { error: erroInserir } = await supabase
      .from("regras_qualificacao_torneio")
      .insert(regrasComOrdem);

    if (erroInserir) {
      console.error("Erro ao inserir regras:", erroInserir);
      return NextResponse.json(
        { error: "Erro ao guardar regras de qualificação" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro na API de qualificação:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
