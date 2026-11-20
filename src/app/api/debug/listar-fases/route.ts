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

    // Buscar todas as fases
    const { data: fases, error } = await supabase
      .from("fases_torneio" as any)
      .select("*")
      .eq("torneio_id", torneioId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      sucesso: true,
      total: fases?.length || 0,
      fases: fases || [],
    });
  } catch (erro) {
    console.error("Erro:", erro);
    return NextResponse.json({ error: String(erro) }, { status: 500 });
  }
}
