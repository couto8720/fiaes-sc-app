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

    const { golos_equipa_1, golos_equipa_2, estado, data_hora, local_id } = body;

    let finalLocalId = local_id;

    // Se foi passado um local_id que é um string (nome do local), procurar ou criar
    if (local_id && typeof local_id === "string" && !local_id.match(/^[0-9a-f-]{36}$/i)) {
      // É um nome, não um UUID
      const { data: localExistente } = await supabase
        .from("locais")
        .select("id")
        .eq("nome", local_id)
        .single();

      if (localExistente) {
        finalLocalId = localExistente.id;
      } else {
        // Criar novo local
        const { data: novoLocal, error: erroInserirLocal } = await supabase
          .from("locais")
          .insert({ nome: local_id })
          .select("id")
          .single();

        if (erroInserirLocal || !novoLocal) {
          console.error("Erro ao criar local:", erroInserirLocal);
          finalLocalId = null;
        } else {
          finalLocalId = novoLocal.id;
        }
      }
    }

    const { error: erroAtualizar } = await supabase
      .from("jogos_torneio")
      .update({
        golos_equipa_1,
        golos_equipa_2,
        data_hora,
        local_id: finalLocalId || null,
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
    console.error("Erro na API de atualizar jogo:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
