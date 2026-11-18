import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await req.json();

    const { nome, escalao_id, fase_torneio_id } = body;

    if (!nome) {
      return NextResponse.json({ error: "Nome da equipa é obrigatório" }, { status: 400 });
    }

    // Criar equipa
    const { data: equipa, error: erroCriar } = await supabase
      .from("equipas_torneio")
      .insert({
        torneio_id: id,
        fase_torneio_id,
        nome,
        escalao_id,
      })
      .select()
      .single();

    if (erroCriar || !equipa) {
      console.error("Erro ao criar equipa:", erroCriar?.message || erroCriar);
      return NextResponse.json(
        { error: "Erro ao criar equipa", details: erroCriar?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(equipa);
  } catch (erro) {
    console.error("Erro na API de equipas:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: equipas, error } = await supabase
      .from("equipas_torneio")
      .select("*")
      .eq("torneio_id", id)
      .order("nome");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(equipas || []);
  } catch (erro) {
    console.error("Erro na API de equipas:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
