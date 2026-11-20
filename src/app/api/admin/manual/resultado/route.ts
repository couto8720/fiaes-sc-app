import { createClient } from "@/lib/supabase/server";
import { exigirSessao } from "@/lib/sessao";

export async function POST(request: Request) {
  try {
    const sessao = await exigirSessao();
    const supabase = await createClient();

    const { escalaoId, adversario, golosClube, golosAdversario } = await request.json();

    if (!escalaoId || !adversario || golosClube === null || golosAdversario === null) {
      return Response.json({ message: "Dados inválidos" }, { status: 400 });
    }

    // Buscar o último jogo sem resultado para este escalão
    const { data: jogo, error: erroJogo } = await supabase
      .from("jogos" as any)
      .select("id, escalao_id")
      .eq("escalao_id", escalaoId)
      .is("golos_clube", null)
      .order("data_hora", { ascending: false })
      .limit(1)
      .single();

    if (erroJogo || !jogo) {
      return Response.json({ message: "Nenhum jogo pendente encontrado" }, { status: 404 });
    }

    // Atualizar o jogo com os golos
    const { error } = await supabase
      .from("jogos" as any)
      .update({
        golos_clube: golosClube,
        golos_adversario: golosAdversario,
        estado: "final",
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", jogo.id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (err) {
    console.error("Erro ao salvar resultado:", err);
    return Response.json(
      { message: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
