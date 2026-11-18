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

    const { nome, fase_torneio_id } = body;

    if (!nome || !fase_torneio_id) {
      return NextResponse.json(
        { error: "Nome e fase são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: equipa, error: erroInserir } = await supabase
      .from("equipas_torneio")
      .insert({
        torneio_id: id,
        fase_torneio_id,
        nome,
      })
      .select()
      .single();

    if (erroInserir || !equipa) {
      console.error("Erro ao inserir equipa:", erroInserir);
      return NextResponse.json(
        { error: "Erro ao adicionar equipa" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true, equipa });
  } catch (erro) {
    console.error("Erro na API de equipas:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
